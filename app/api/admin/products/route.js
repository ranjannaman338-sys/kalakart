import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const status = searchParams.get('status');

    await connectDB();
    const filter = {};
    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }
    if (status && ['active', 'inactive', 'draft'].includes(status)) {
      filter.status = status;
    }

    const products = await Product.find(filter)
      .populate('categoryId', 'name slug')
      .populate('sellerId', 'name email')
      .populate('sellerProfileId', 'shopName slug')
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ products });
  } catch (error) {
    console.error('Admin products error:', error);
    return apiError(error.message || 'Failed to fetch products for moderation', 500);
  }
}
