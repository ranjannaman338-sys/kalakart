import connectDB from '@/lib/mongodb';
import User from '@/models/User';
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
    const role = searchParams.get('role');

    await connectDB();
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }
    if (role && ['customer', 'seller', 'admin'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    return apiError(error.message || 'Failed to fetch users', 500);
  }
}
