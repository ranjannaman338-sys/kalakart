import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireSeller } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireSeller(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const products = await Product.find({ sellerId: user._id })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ products });
  } catch (error) {
    console.error('Fetch seller products error:', error);
    return apiError(error.message || 'Failed to fetch products', 500);
  }
}
