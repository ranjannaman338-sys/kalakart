import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

export const SHIPPING_FEE = 99;
export const FREE_SHIPPING_THRESHOLD = 999;

/**
 * Calculates and verifies prices directly against database products.
 * Never trusts prices provided by client requests.
 */
export async function calculateOrderPricing({ items, couponCode }) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('No items specified for pricing calculation.');
  }

  // 1. Fetch products from database
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).populate('sellerId');

  const productMap = new Map();
  products.forEach((p) => productMap.set(p._id.toString(), p));

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const pId = item.productId.toString();
    const product = productMap.get(pId);

    if (!product) {
      throw new Error(`Product with ID ${pId} was not found or is no longer available.`);
    }

    if (product.status !== 'active') {
      throw new Error(`Product "${product.name}" is currently inactive.`);
    }

    const requestedQty = parseInt(item.quantity, 10);
    if (isNaN(requestedQty) || requestedQty <= 0) {
      throw new Error(`Invalid quantity ${item.quantity} for product "${product.name}".`);
    }

    if (product.stock < requestedQty) {
      throw new Error(
        `Insufficient stock for "${product.name}". Only ${product.stock} items available.`
      );
    }

    const unitPrice = product.price;
    const lineTotal = unitPrice * requestedQty;
    subtotal += lineTotal;

    verifiedItems.push({
      productId: product._id,
      sellerId: product.sellerId._id || product.sellerId,
      productNameSnapshot: product.name,
      productImageSnapshot: product.images?.[0] || '',
      unitPriceSnapshot: unitPrice,
      quantity: requestedQty,
      lineTotal,
    });
  }

  // 2. Shipping calculation
  const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  // 3. Coupon validation & calculation
  let discountAmount = 0;
  let appliedCoupon = null;

  if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
    const code = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) {
      throw new Error(`Coupon "${code}" is invalid or inactive.`);
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw new Error(`Coupon "${code}" has expired.`);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new Error(`Coupon "${code}" usage limit has been reached.`);
    }

    if (subtotal < coupon.minimumOrderValue) {
      throw new Error(
        `Coupon "${code}" requires a minimum order value of ₹${coupon.minimumOrderValue}.`
      );
    }

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount && coupon.maximumDiscount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
      }
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = coupon.discountValue;
    }

    // Discount cannot exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);
    appliedCoupon = coupon;
  }

  const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

  return {
    subtotal,
    shippingAmount,
    discountAmount,
    totalAmount,
    coupon: appliedCoupon,
    verifiedItems,
  };
}
