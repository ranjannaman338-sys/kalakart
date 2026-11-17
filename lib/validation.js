import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().default(''),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const addressSchema = z.object({
  name: z.string().min(2, 'Recipient name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().default('India'),
  isDefault: z.boolean().optional().default(false),
});

export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters').max(120),
  description: z.string().min(15, 'Description must be at least 15 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than zero'),
  compareAtPrice: z.number().nonnegative().optional().default(0),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  images: z.array(z.string().url('Image must be a valid URL')).min(1, 'At least one product image is required'),
  materials: z.string().optional().default(''),
  dimensions: z.string().optional().default(''),
  weight: z.string().optional().default(''),
  preparationTime: z.string().optional().default('2-4 days'),
  status: z.enum(['draft', 'active', 'inactive']).default('active'),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required').max(50),
  description: z.string().optional().default(''),
  image: z.string().url('Category image must be a valid URL'),
  isActive: z.boolean().optional().default(true),
});

export const sellerApplySchema = z.object({
  shopName: z.string().min(3, 'Shop name must be at least 3 characters').max(80),
  description: z.string().min(20, 'Shop description must be at least 20 characters'),
  location: z.string().min(3, 'Shop location/city is required'),
  logo: z.string().optional().default(''),
  banner: z.string().optional().default(''),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive('Discount value must be positive'),
  minimumOrderValue: z.number().nonnegative().default(0),
  maximumDiscount: z.number().nonnegative().optional().default(0),
  expiryDate: z.string().or(z.date()),
  usageLimit: z.number().int().positive().optional().default(100),
  isActive: z.boolean().default(true),
});

export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(5, 'Review comment must be at least 5 characters').max(1000),
});

export const checkoutValidationSchema = z.object({
  address: addressSchema,
  couponCode: z.string().optional().default(''),
  paymentMethod: z.enum(['COD', 'RAZORPAY']),
  idempotencyKey: z.string().optional(),
});

export function validateBody(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return { data: null, errors: formattedErrors };
  }
  return { data: result.data, errors: null };
}
