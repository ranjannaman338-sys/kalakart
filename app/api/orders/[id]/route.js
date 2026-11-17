import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Review from '@/models/Review';
import { requireAuth } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError('Invalid order ID', 400);
    }

    await connectDB();
    const order = await Order.findById(id).lean();
    if (!order) {
      return apiError('Order not found', 404);
    }

    // Ownership check: Customer who placed order or Admin
    const isOwner = order.userId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return apiError('Access denied. You cannot view this order.', 403);
    }

    // Fetch any reviews created by this user for products in this order
    const reviews = await Review.find({
      orderId: order._id,
      userId: user._id,
    }).lean();

    return apiSuccess({
      order,
      reviews,
    });
  } catch (error) {
    console.error('Fetch order detail error:', error);
    return apiError(error.message || 'Failed to fetch order', 500);
  }
}

export async function PATCH(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    // Only Admin can update top-level overall order status directly
    if (user.role !== 'admin') {
      return apiError('Administrator authorization required to update order status.', 403);
    }

    const { id } = params;
    const body = await req.json();
    const { orderStatus, note = '' } = body;

    const validStatuses = [
      'ORDER_PLACED',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(orderStatus)) {
      return apiError('Invalid order status.', 400);
    }

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return apiError('Order not found', 404);
    }

    order.orderStatus = orderStatus;
    if (orderStatus === 'DELIVERED' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'PAID';
    }
    order.statusHistory.push({
      status: orderStatus,
      note: note || `Status updated to ${orderStatus} by administrator`,
      timestamp: new Date(),
    });

    await order.save();
    return apiSuccess(order);
  } catch (error) {
    console.error('Order status update error:', error);
    return apiError(error.message || 'Failed to update order status', 500);
  }
}
