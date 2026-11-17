import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { requireAuth } from '@/lib/permissions';
import { calculateOrderPricing } from '@/lib/pricing';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { couponCode, items: directItems } = body;

    await connectDB();

    // Use either directly passed items (e.g. "Buy Now") or user's active cart
    let itemsToPrice = directItems;
    if (!itemsToPrice || !Array.isArray(itemsToPrice) || itemsToPrice.length === 0) {
      const cart = await Cart.findOne({ userId: user._id });
      if (!cart || !cart.items || cart.items.length === 0) {
        return apiError('Your cart is empty', 400);
      }
      itemsToPrice = cart.items.map((it) => ({
        productId: it.productId.toString(),
        quantity: it.quantity,
      }));
    }

    const pricing = await calculateOrderPricing({
      items: itemsToPrice,
      couponCode,
    });

    return apiSuccess({
      subtotal: pricing.subtotal,
      shippingAmount: pricing.shippingAmount,
      discountAmount: pricing.discountAmount,
      totalAmount: pricing.totalAmount,
      appliedCoupon: pricing.coupon
        ? {
            code: pricing.coupon.code,
            discountType: pricing.coupon.discountType,
            discountValue: pricing.coupon.discountValue,
          }
        : null,
      items: pricing.verifiedItems,
    });
  } catch (error) {
    console.error('Checkout validation error:', error);
    return apiError(error.message || 'Validation failed', 400);
  }
}
