import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/permissions';
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '@/lib/pricing';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const cart = await Cart.findOne({ userId: user._id }).populate({
      path: 'items.productId',
      populate: [
        { path: 'categoryId', select: 'name slug' },
        { path: 'sellerProfileId', select: 'shopName slug location' },
      ],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return apiSuccess({
        items: [],
        subtotal: 0,
        shippingAmount: 0,
        totalAmount: 0,
        itemCount: 0,
      });
    }

    // Filter out deleted/inactive products and construct accurate totals
    const validItems = [];
    let subtotal = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      const product = item.productId;
      if (!product || product.status !== 'active') {
        continue;
      }

      // Check if stock is lower than requested quantity
      const availableStock = product.stock;
      const quantity = Math.min(item.quantity, Math.max(1, availableStock));
      const lineTotal = product.price * quantity;

      subtotal += lineTotal;
      itemCount += quantity;

      validItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || '',
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        isOutOfStock: product.stock <= 0,
        seller: product.sellerProfileId || { shopName: 'Artisan Shop' },
        quantity,
        lineTotal,
      });
    }

    const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
    const totalAmount = subtotal + shippingAmount;

    return apiSuccess({
      items: validItems,
      subtotal,
      shippingAmount,
      totalAmount,
      itemCount,
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return apiError(error.message || 'Failed to fetch cart', 500);
  }
}

export async function DELETE(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    await Cart.findOneAndUpdate({ userId: user._id }, { items: [] });

    return apiSuccess({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return apiError(error.message || 'Failed to clear cart', 500);
  }
}
