import Razorpay from 'razorpay';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return apiError(
        'Razorpay credentials are not configured on this server. Please use Cash on Delivery.',
        503
      );
    }

    const body = await req.json();
    const { orderId } = body;

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return apiError('Order not found', 404);
    }

    if (order.userId.toString() !== user._id.toString()) {
      return apiError('Access denied', 403);
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Amount in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: `order_rcptid_${order._id.toString().slice(-10)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return apiSuccess({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return apiError(error.message || 'Failed to initiate Razorpay transaction', 500);
  }
}
