import crypto from 'crypto';
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

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return apiError('Razorpay secret not configured', 503);
    }

    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return apiError('Missing payment verification parameters', 400);
    }

    // Verify HMAC signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return apiError('Payment verification failed: Signature mismatch', 400);
    }

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return apiError('Order not found', 404);
    }

    order.paymentStatus = 'PAID';
    order.orderStatus = 'CONFIRMED';
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.statusHistory.push({
      status: 'CONFIRMED',
      note: `Payment verified successfully via Razorpay (Payment ID: ${razorpayPaymentId})`,
      timestamp: new Date(),
    });

    await order.save();

    return apiSuccess({
      message: 'Payment verified and order confirmed successfully',
      order,
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    return apiError(error.message || 'Payment verification failed', 500);
  }
}
