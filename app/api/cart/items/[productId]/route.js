import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function PATCH(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { productId } = params;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return apiError('Valid productId is required', 400);
    }

    const body = await req.json();
    const qty = parseInt(body.quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return apiError('Quantity must be at least 1', 400);
    }

    await connectDB();
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return apiError('Product not found or unavailable', 404);
    }

    if (qty > product.stock) {
      return apiError(`Cannot exceed available stock of ${product.stock}`, 400);
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return apiError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return apiError('Item not found in cart', 404);
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();

    return apiSuccess({ message: 'Cart updated', quantity: qty });
  } catch (error) {
    console.error('Update cart item error:', error);
    return apiError(error.message || 'Failed to update cart item', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { productId } = params;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return apiError('Valid productId is required', 400);
    }

    await connectDB();
    const cart = await Cart.findOne({ userId: user._id });
    if (cart) {
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId.toString()
      );
      await cart.save();
    }

    return apiSuccess({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return apiError(error.message || 'Failed to remove cart item', 500);
  }
}
