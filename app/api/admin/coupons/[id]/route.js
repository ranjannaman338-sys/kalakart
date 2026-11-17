import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
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
      return apiError('Invalid coupon ID', 400);
    }

    const body = await req.json();
    await connectDB();

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return apiError('Coupon not found', 404);
    }

    if (body.isActive !== undefined) coupon.isActive = Boolean(body.isActive);
    if (body.discountValue !== undefined) coupon.discountValue = body.discountValue;
    if (body.minimumOrderValue !== undefined) coupon.minimumOrderValue = body.minimumOrderValue;
    if (body.maximumDiscount !== undefined) coupon.maximumDiscount = body.maximumDiscount;
    if (body.expiryDate) coupon.expiryDate = new Date(body.expiryDate);
    if (body.usageLimit !== undefined) coupon.usageLimit = body.usageLimit;

    await coupon.save();

    return apiSuccess(coupon);
  } catch (error) {
    console.error('Update coupon error:', error);
    return apiError(error.message || 'Failed to update coupon', 500);
  }
}
