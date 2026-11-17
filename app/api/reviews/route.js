import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/permissions';
import { reviewSchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { data, errors } = validateBody(reviewSchema, body);
    if (errors) {
      return apiError('Validation failed', 422, errors);
    }

    await connectDB();

    // 1. Check order belongs to user, is delivered, and contains product
    const order = await Order.findOne({
      _id: data.orderId,
      userId: user._id,
    });

    if (!order) {
      return apiError('Matching order was not found for this account.', 404);
    }

    if (order.orderStatus !== 'DELIVERED') {
      return apiError(
        'Reviews can only be submitted after your order has been successfully delivered.',
        400
      );
    }

    const itemExists = order.items.some(
      (it) => it.productId.toString() === data.productId.toString()
    );

    if (!itemExists) {
      return apiError('This product was not part of the specified order.', 400);
    }

    // 2. Prevent duplicate review for the same purchase
    const existingReview = await Review.findOne({
      userId: user._id,
      productId: data.productId,
      orderId: data.orderId,
    });

    if (existingReview) {
      return apiError('You have already submitted a review for this purchase.', 409);
    }

    // 3. Create review
    const review = await Review.create({
      userId: user._id,
      productId: data.productId,
      orderId: data.orderId,
      rating: data.rating,
      comment: data.comment,
    });

    // 4. Update Product average rating and review count
    const allReviews = await Review.find({ productId: data.productId });
    const count = allReviews.length;
    const avg = count > 0 ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : 0;

    await Product.findByIdAndUpdate(data.productId, {
      averageRating: parseFloat(avg),
      reviewCount: count,
    });

    const populatedReview = await Review.findById(review._id).populate('userId', 'name avatar');

    return apiSuccess(populatedReview, 201);
  } catch (error) {
    console.error('Submit review error:', error);
    return apiError(error.message || 'Failed to submit review', 500);
  }
}
