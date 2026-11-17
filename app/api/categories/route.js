import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/permissions';
import { categorySchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    return apiSuccess({ categories });
  } catch (error) {
    console.error('Categories error:', error);
    return apiError(error.message || 'Failed to fetch categories', 500);
  }
}

export async function POST(req) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { data, errors } = validateBody(categorySchema, body);
    if (errors) {
      return apiError('Validation failed', 422, errors);
    }

    await connectDB();

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return apiError('A category with this name already exists.', 409);
    }

    const category = await Category.create({
      ...data,
      slug,
    });

    return apiSuccess(category, 201);
  } catch (error) {
    console.error('Category create error:', error);
    return apiError(error.message || 'Failed to create category', 500);
  }
}
