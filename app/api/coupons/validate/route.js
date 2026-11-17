import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { code, subtotal = 0 } = body;

    if (!code || typeof code !== 'string') {
      return apiError('Coupon code is required', 400);
    }

    await connectDB();
    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return apiError('Coupon code is invalid or has expired', 404);
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return apiError('This coupon has expired', 400);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return apiError('Coupon usage limit has been reached', 400);
    }

    if (subtotal < coupon.minimumOrderValue) {
      return apiError(
        `Minimum order value of ₹${coupon.minimumOrderValue} required for this coupon`,
        400
      );
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount && coupon.maximumDiscount > 0) {
        discount = Math.min(discount, coupon.maximumDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, subtotal);

    return apiSuccess({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      message: `Coupon applied successfully! You saved ₹${discount}`,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return apiError(error.message || 'Failed to validate coupon', 500);
  }
}
