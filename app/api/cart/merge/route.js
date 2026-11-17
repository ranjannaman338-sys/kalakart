import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { items = [] } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return apiSuccess({ message: 'No items to merge' });
    }

    await connectDB();
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({ userId: user._id, items: [] });
    }

    for (const item of items) {
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) continue;
      const product = await Product.findById(item.productId);
      if (!product || product.status !== 'active') continue;

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const existingIdx = cart.items.findIndex(
        (ci) => ci.productId.toString() === item.productId.toString()
      );

      if (existingIdx > -1) {
        cart.items[existingIdx].quantity = Math.min(
          product.stock,
          cart.items[existingIdx].quantity + qty
        );
      } else {
        cart.items.push({
          productId: new mongoose.Types.ObjectId(item.productId),
          quantity: Math.min(product.stock, qty),
        });
      }
    }

    await cart.save();
    return apiSuccess({ message: 'Cart merged successfully' });
  } catch (error) {
    console.error('Merge cart error:', error);
    return apiError(error.message || 'Failed to merge cart', 500);
  }
}
