import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import { requireAuth } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function DELETE(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { productId } = params;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return apiError('Valid productId is required', 400);
    }

    await connectDB();
    const wishlist = await Wishlist.findOne({ userId: user._id });
    if (wishlist) {
      wishlist.productIds = wishlist.productIds.filter((p) => p.toString() !== productId);
      await wishlist.save();
    }

    return apiSuccess({ message: 'Item removed from wishlist', productId });
  } catch (error) {
    console.error('Wishlist delete item error:', error);
    return apiError(error.message || 'Failed to remove from wishlist', 500);
  }
}
