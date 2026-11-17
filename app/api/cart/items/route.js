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
    const { productId, quantity = 1 } = body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return apiError('Valid productId is required', 400);
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return apiError('Quantity must be at least 1', 400);
    }

    await connectDB();
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return apiError('Product not found or unavailable', 404);
    }

    if (product.stock < qty) {
      return apiError(`Only ${product.stock} items in stock for this product`, 400);
    }

    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({ userId: user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + qty;
      if (newQty > product.stock) {
        return apiError(
          `Cannot add more. You already have ${cart.items[itemIndex].quantity} in cart, and total stock is ${product.stock}.`,
          400
        );
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity: qty,
      });
    }

    await cart.save();

    return apiSuccess({
      message: 'Item added to cart',
      itemCount: cart.items.reduce((acc, it) => acc + it.quantity, 0),
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return apiError(error.message || 'Failed to add item to cart', 500);
  }
}
