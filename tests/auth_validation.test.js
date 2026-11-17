import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, signToken, verifyToken } from '../lib/auth.js';
import {
  registerSchema,
  loginSchema,
  productSchema,
  couponSchema,
  validateBody,
} from '../lib/validation.js';

describe('Auth & Security Utilities', () => {
  it('should hash a password and correctly verify it with bcrypt', async () => {
    const rawPassword = 'SecureHandmadePass99!';
    const hashed = await hashPassword(rawPassword);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(rawPassword);

    const isMatch = await comparePassword(rawPassword, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword', hashed);
    expect(isWrongMatch).toBe(false);
  });

  it('should sign and verify JWT tokens containing user payload', () => {
    const payload = { userId: 'user_12345', role: 'seller' };
    const token = signToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).toBeDefined();
    expect(decoded.userId).toBe('user_12345');
    expect(decoded.role).toBe('seller');
  });

  it('should reject invalid registration payloads with meaningful errors', () => {
    const invalid = { name: 'A', email: 'not-an-email', password: '123' };
    const { data, errors } = validateBody(registerSchema, invalid);

    expect(data).toBeNull();
    expect(errors).toBeInstanceOf(Array);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should accept valid registration payloads', () => {
    const valid = {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      password: 'SafePassword123!',
      phone: '+919876543210',
    };
    const { data, errors } = validateBody(registerSchema, valid);

    expect(errors).toBeNull();
    expect(data.email).toBe('rohan.sharma@example.com');
  });
});

describe('Product & Coupon Validation Schemas', () => {
  it('should reject products without images or negative stock', () => {
    const badProduct = {
      name: 'Mini Terracotta Pot',
      description: 'Handmade clay pot with fine finish for succulents.',
      categoryId: 'cat_123',
      price: 450,
      stock: -5,
      images: [],
    };

    const { data, errors } = validateBody(productSchema, badProduct);
    expect(data).toBeNull();
    expect(errors.some((e) => e.field.includes('stock'))).toBe(true);
    expect(errors.some((e) => e.field.includes('images'))).toBe(true);
  });

  it('should validate coupons and discount structures', () => {
    const validCoupon = {
      code: 'kala20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minimumOrderValue: 1000,
      maximumDiscount: 500,
      expiryDate: new Date(Date.now() + 1000000).toISOString(),
    };

    const { data, errors } = validateBody(couponSchema, validCoupon);
    expect(errors).toBeNull();
    expect(data.code).toBe('KALA20');
  });
});
