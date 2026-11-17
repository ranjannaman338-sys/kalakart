import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    let wishlist = await Wishlist.findOne({ userId: user._id })
      .populate({
        path: 'productIds',
        match: { status: 'active' },
        populate: [
          { path: 'categoryId', select: 'name slug' },
          { path: 'sellerProfileId', select: 'shopName slug' },
        ],
      })
      .lean();

    if (!wishlist) {
      wishlist = { userId: user._id, productIds: [] };
    }

    return apiSuccess({ wishlist: wishlist.productIds || [] });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return apiError(error.message || 'Failed to fetch wishlist', 500);
  }
}

export async function POST(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { productId } = body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return apiError('Valid productId is required', 400);
    }

    await connectDB();

    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return apiError('Product not found or unavailable', 404);
    }

    let wishlist = await Wishlist.findOne({ userId: user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: user._id, productIds: [] });
    }

    const pIdStr = productId.toString();
    const alreadySaved = wishlist.productIds.some((p) => p.toString() === pIdStr);

    let isAdded = false;
    if (alreadySaved) {
      // Toggle off / remove
      wishlist.productIds = wishlist.productIds.filter((p) => p.toString() !== pIdStr);
      isAdded = false;
    } else {
      // Add
      wishlist.productIds.push(new mongoose.Types.ObjectId(productId));
      isAdded = true;
    }

    await wishlist.save();

    return apiSuccess({
      message: isAdded ? 'Added to wishlist' : 'Removed from wishlist',
      isWishlisted: isAdded,
      productId,
    });
  } catch (error) {
    console.error('Wishlist update error:', error);
    return apiError(error.message || 'Failed to update wishlist', 500);
  }
}
