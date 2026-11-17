import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import SellerFulfillment from '@/models/SellerFulfillment';
import Order from '@/models/Order';
import { requireSeller } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function PATCH(req, { params }) {
  try {
    const { user, errorResponse, isAdmin } = await requireSeller(req);
    if (errorResponse) return errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError('Invalid fulfillment ID', 400);
    }

    const body = await req.json();
    const { status, note = '' } = body;

    const validStatuses = [
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return apiError('Invalid fulfillment status transition', 400);
    }

    await connectDB();
    const fulfillment = await SellerFulfillment.findById(id);
    if (!fulfillment) {
      return apiError('Fulfillment record not found', 404);
    }

    // Ownership check: seller must own this fulfillment (unless admin)
    if (!isAdmin && fulfillment.sellerId.toString() !== user._id.toString()) {
      return apiError('Access denied. You cannot modify fulfillment for another seller.', 403);
    }

    fulfillment.fulfillmentStatus = status;
    if (status === 'SHIPPED') {
      fulfillment.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      fulfillment.deliveredAt = new Date();
    }

    fulfillment.statusHistory.push({
      status,
      note: note || `Status updated to ${status} by artisan`,
      timestamp: new Date(),
    });

    await fulfillment.save();

    // Check if overall parent order status can be advanced
    const allFulfillments = await SellerFulfillment.find({ orderId: fulfillment.orderId });
    const allDelivered = allFulfillments.every((f) => f.fulfillmentStatus === 'DELIVERED');
    const anyShipped = allFulfillments.some((f) => ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(f.fulfillmentStatus));

    const order = await Order.findById(fulfillment.orderId);
    if (order && order.orderStatus !== 'CANCELLED') {
      if (allDelivered && order.orderStatus !== 'DELIVERED') {
        order.orderStatus = 'DELIVERED';
        if (order.paymentMethod === 'COD') {
          order.paymentStatus = 'PAID';
        }
        order.statusHistory.push({
          status: 'DELIVERED',
          note: 'All artisan packages delivered successfully',
          timestamp: new Date(),
        });
        await order.save();
      } else if (anyShipped && ['ORDER_PLACED', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus)) {
        order.orderStatus = 'SHIPPED';
        order.statusHistory.push({
          status: 'SHIPPED',
          note: 'Order items dispatched by artisan(s)',
          timestamp: new Date(),
        });
        await order.save();
      }
    }

    return apiSuccess({
      message: 'Fulfillment status updated successfully',
      fulfillment,
    });
  } catch (error) {
    console.error('Update fulfillment error:', error);
    return apiError(error.message || 'Failed to update fulfillment', 500);
  }
}
