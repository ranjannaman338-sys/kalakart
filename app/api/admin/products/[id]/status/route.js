import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function PATCH(req, { params }) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError('Invalid product ID', 400);
    }

    const body = await req.json();
    const { status } = body;

    if (!['active', 'inactive', 'draft'].includes(status)) {
      return apiError('Invalid product status', 400);
    }

    await connectDB();
    const product = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!product) {
      return apiError('Product not found', 404);
    }

    return apiSuccess({
      message: `Product status updated to ${status}`,
      product,
    });
  } catch (error) {
    console.error('Update product status error:', error);
    return apiError(error.message || 'Failed to update product status', 500);
  }
}
