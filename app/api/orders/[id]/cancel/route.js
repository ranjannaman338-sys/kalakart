import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import SellerFulfillment from '@/models/SellerFulfillment';
import { requireAuth } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError('Invalid order ID', 400);
    }

    const body = await req.json().catch(() => ({}));
    const { reason = 'Cancelled by customer' } = body;

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return apiError('Order not found', 404);
    }

    const isOwner = order.userId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return apiError('Access denied. You cannot cancel this order.', 403);
    }

    // Eligibility check
    const cancellableStatuses = ['ORDER_PLACED', 'CONFIRMED'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return apiError(
        `Order cannot be cancelled because it is already ${order.orderStatus}.`,
        400
      );
    }

    // 1. Restore product stock atomically
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    // 2. Update order
    order.orderStatus = 'CANCELLED';
    order.cancellationReason = reason;
    order.cancelledAt = new Date();
    order.statusHistory.push({
      status: 'CANCELLED',
      note: `Cancelled: ${reason}`,
      timestamp: new Date(),
    });
    await order.save();

    // 3. Update fulfillments
    await SellerFulfillment.updateMany(
      { orderId: order._id },
      {
        fulfillmentStatus: 'CANCELLED',
        $push: {
          statusHistory: {
            status: 'CANCELLED',
            note: 'Order cancelled by customer',
            timestamp: new Date(),
          },
        },
      }
    );

    return apiSuccess({
      message: 'Order has been successfully cancelled and stock restored.',
      order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return apiError(error.message || 'Failed to cancel order', 500);
  }
}
