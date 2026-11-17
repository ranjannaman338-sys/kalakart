import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import SellerFulfillment from '@/models/SellerFulfillment';
import { requireAuth } from '@/lib/permissions';
import { calculateOrderPricing } from '@/lib/pricing';
import { checkoutValidationSchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const orders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return apiError(error.message || 'Failed to fetch orders', 500);
  }
}

export async function POST(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { data, errors } = validateBody(checkoutValidationSchema, body);
    if (errors) {
      return apiError('Validation failed', 422, errors);
    }

    await connectDB();

    // Idempotency check: prevent duplicate order submissions
    if (data.idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey: data.idempotencyKey });
      if (existingOrder) {
        return apiSuccess(existingOrder, 200);
      }
    }

    // Determine items: either from request (buy now) or user's cart
    let requestedItems = body.items;
    let isCartOrder = false;

    if (!requestedItems || !Array.isArray(requestedItems) || requestedItems.length === 0) {
      const cart = await Cart.findOne({ userId: user._id });
      if (!cart || !cart.items || cart.items.length === 0) {
        return apiError('Cart is empty. Please add items before checking out.', 400);
      }
      requestedItems = cart.items.map((it) => ({
        productId: it.productId.toString(),
        quantity: it.quantity,
      }));
      isCartOrder = true;
    }

    // 1. Calculate and verify pricing on server (never trust client prices)
    const pricing = await calculateOrderPricing({
      items: requestedItems,
      couponCode: data.couponCode,
    });

    // 2. Atomic stock verification and reservation
    // Attempt decrement on each product; if any fails, compensate rollback
    const decrementedProducts = [];
    for (const item of pricing.verifiedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
          status: 'active',
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true }
      );

      if (!updatedProduct) {
        // Rollback already decremented products
        for (const rolledBack of decrementedProducts) {
          await Product.findByIdAndUpdate(rolledBack.productId, {
            $inc: { stock: rolledBack.quantity },
          });
        }
        return apiError(
          `Insufficient stock or concurrent purchase conflict for "${item.productNameSnapshot}". Please review your cart.`,
          409
        );
      }

      decrementedProducts.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    // 3. Increment coupon usage if applied
    if (pricing.coupon) {
      await Coupon.findByIdAndUpdate(pricing.coupon._id, {
        $inc: { usageCount: 1 },
      });
    }

    // 4. Create Order
    const newOrder = await Order.create({
      userId: user._id,
      items: pricing.verifiedItems,
      addressSnapshot: data.address,
      subtotal: pricing.subtotal,
      shippingAmount: pricing.shippingAmount,
      discountAmount: pricing.discountAmount,
      totalAmount: pricing.totalAmount,
      couponCode: pricing.coupon ? pricing.coupon.code : '',
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      orderStatus: 'ORDER_PLACED',
      statusHistory: [
        {
          status: 'ORDER_PLACED',
          note: `Order placed via ${data.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}.`,
          timestamp: new Date(),
        },
      ],
      idempotencyKey: data.idempotencyKey || null,
    });

    // 5. Partition by seller and create SellerFulfillment entries
    const itemsBySeller = new Map();
    pricing.verifiedItems.forEach((it) => {
      const sId = it.sellerId.toString();
      if (!itemsBySeller.has(sId)) {
        itemsBySeller.set(sId, []);
      }
      itemsBySeller.get(sId).push(it);
    });

    for (const [sellerId, sellerItems] of itemsBySeller.entries()) {
      await SellerFulfillment.create({
        orderId: newOrder._id,
        sellerId: new mongoose.Types.ObjectId(sellerId),
        items: sellerItems,
        fulfillmentStatus: 'PENDING',
        statusHistory: [
          {
            status: 'PENDING',
            note: 'Order received by marketplace',
            timestamp: new Date(),
          },
        ],
      });
    }

    // 6. Clear user cart ONLY after order creation succeeds
    if (isCartOrder) {
      await Cart.findOneAndUpdate({ userId: user._id }, { items: [] });
    }

    return apiSuccess(newOrder, 201);
  } catch (error) {
    console.error('Order creation error:', error);
    return apiError(error.message || 'Failed to place order', 500);
  }
}
