import connectDB from '@/lib/mongodb';
import SellerFulfillment from '@/models/SellerFulfillment';
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
    const fulfillments = await SellerFulfillment.find({ sellerId: user._id })
      .populate('orderId', 'createdAt orderStatus addressSnapshot paymentMethod paymentStatus totalAmount')
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ fulfillments });
  } catch (error) {
    console.error('Fetch seller orders error:', error);
    return apiError(error.message || 'Failed to fetch seller orders', 500);
  }
}
