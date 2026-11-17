import connectDB from '@/lib/mongodb';
import SellerProfile from '@/models/SellerProfile';
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
    if (status && ['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      filter.applicationStatus = status;
    }

    const sellers = await SellerProfile.find(filter)
      .populate('userId', 'name email phone avatar createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ sellers });
  } catch (error) {
    console.error('Admin sellers error:', error);
    return apiError(error.message || 'Failed to fetch sellers', 500);
  }
}
