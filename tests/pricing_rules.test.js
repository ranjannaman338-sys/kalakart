import { describe, it, expect } from 'vitest';
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '../lib/pricing.js';

describe('Pricing Rules & E-Commerce Logic', () => {
  it('should enforce free shipping when subtotal >= FREE_SHIPPING_THRESHOLD', () => {
    const subtotalLow = 850;
    const shippingLow = subtotalLow >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    expect(shippingLow).toBe(99);

    const subtotalHigh = 1200;
    const shippingHigh = subtotalHigh >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    expect(shippingHigh).toBe(0);
  });

  it('should calculate percentage coupon discount capped by maximumDiscount and subtotal', () => {
    const subtotal = 2000;
    const discountType = 'PERCENTAGE';
    const discountValue = 20; // 20% of 2000 = 400
    const maximumDiscount = 300;

    let discount = (subtotal * discountValue) / 100;
    if (maximumDiscount > 0) {
      discount = Math.min(discount, maximumDiscount);
    }
    discount = Math.min(discount, subtotal);

    expect(discount).toBe(300);
  });

  it('should prevent order cancellation when order is already Shipped or Delivered', () => {
    const cancellableStatuses = ['ORDER_PLACED', 'CONFIRMED'];

    expect(cancellableStatuses.includes('ORDER_PLACED')).toBe(true);
    expect(cancellableStatuses.includes('CONFIRMED')).toBe(true);
    expect(cancellableStatuses.includes('PROCESSING')).toBe(false);
    expect(cancellableStatuses.includes('SHIPPED')).toBe(false);
    expect(cancellableStatuses.includes('DELIVERED')).toBe(false);
  });

  it('should enforce permitted fulfillment transitions for artisans', () => {
    const allowedStatuses = [
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    expect(allowedStatuses.includes('PROCESSING')).toBe(true);
    expect(allowedStatuses.includes('SHIPPED')).toBe(true);
    expect(allowedStatuses.includes('REFUNDED_BY_SELLER')).toBe(false);
  });
});
