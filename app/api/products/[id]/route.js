import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import { requireAuth } from '@/lib/permissions';
import { productSchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.slug = id;
    }

    const product = await Product.findOne(query)
      .populate('categoryId', 'name slug image')
      .populate('sellerId', 'name avatar')
      .populate('sellerProfileId', 'shopName slug location logo banner description')
      .lean();

    if (!product) {
      return apiError('Product not found', 404);
    }

    // Fetch reviews for this product
    const reviews = await Review.find({ productId: product._id })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return apiSuccess({
      product,
      reviews,
    });
  } catch (error) {
    console.error('Product detail error:', error);
    return apiError(error.message || 'Failed to fetch product', 500);
  }
}

export async function PATCH(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError('Invalid product ID', 400);
    }

    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return apiError('Product not found', 404);
    }

    // Check ownership or admin
    const isOwner = product.sellerId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return apiError('You do not have permission to modify this product', 403);
    }

    const body = await req.json();

    // Partial updates
    const allowedFields = [
      'name',
      'description',
      'categoryId',
      'price',
      'compareAtPrice',
      'stock',
      'images',
      'materials',
      'dimensions',
      'weight',
      'preparationTime',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        product[field] = body[field];
      }
    });

    await product.save();

    const updated = await Product.findById(id)
      .populate('categoryId', 'name slug')
      .populate('sellerId', 'name avatar')
      .populate('sellerProfileId', 'shopName slug location logo');

    return apiSuccess(updated);
  } catch (error) {
    console.error('Product update error:', error);
    return apiError(error.message || 'Failed to update product', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError('Invalid product ID', 400);
    }

    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return apiError('Product not found', 404);
    }

    const isOwner = product.sellerId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return apiError('You do not have permission to delete this product', 403);
    }

    // Soft delete / deactivate
    product.status = 'inactive';
    await product.save();

    return apiSuccess({ message: 'Product deactivated successfully' });
  } catch (error) {
    console.error('Product delete error:', error);
    return apiError(error.message || 'Failed to delete product', 500);
  }
}
