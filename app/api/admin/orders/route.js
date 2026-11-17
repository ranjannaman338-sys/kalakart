import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
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
    const status = searchParams.get('status');

    await connectDB();
    const filter = {};
    if (status) {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ orders });
  } catch (error) {
    console.error('Admin orders error:', error);
    return apiError(error.message || 'Failed to fetch orders', 500);
  }
}
