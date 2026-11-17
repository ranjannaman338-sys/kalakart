import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { requireAdmin } from '@/lib/permissions';
import { couponSchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return apiSuccess({ coupons });
  } catch (error) {
    console.error('Admin coupons error:', error);
    return apiError(error.message || 'Failed to fetch coupons', 500);
  }
}

export async function POST(req) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { data, errors } = validateBody(couponSchema, body);
    if (errors) {
      return apiError('Validation failed', 422, errors);
    }

    await connectDB();
    const existing = await Coupon.findOne({ code: data.code });
    if (existing) {
      return apiError('A coupon with this code already exists.', 409);
    }

    const coupon = await Coupon.create(data);
    return apiSuccess(coupon, 201);
  } catch (error) {
    console.error('Create coupon error:', error);
    return apiError(error.message || 'Failed to create coupon', 500);
  }
}
