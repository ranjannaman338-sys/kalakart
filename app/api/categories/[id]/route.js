import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.slug = id;
    }

    const category = await Category.findOne(query).lean();
    if (!category) {
      return apiError('Category not found', 404);
    }

    return apiSuccess(category);
  } catch (error) {
    return apiError(error.message || 'Failed to fetch category', 500);
  }
}

export async function PATCH(req, { params }) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError('Invalid category ID', 400);
    }

    const body = await req.json();
    await connectDB();

    const category = await Category.findById(id);
    if (!category) {
      return apiError('Category not found', 404);
    }

    if (body.name) {
      category.name = body.name.trim();
      category.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    if (body.description !== undefined) category.description = body.description;
    if (body.image) category.image = body.image;
    if (body.isActive !== undefined) category.isActive = body.isActive;

    await category.save();

    return apiSuccess(category);
  } catch (error) {
    console.error('Category update error:', error);
    return apiError(error.message || 'Failed to update category', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError('Invalid category ID', 400);
    }

    await connectDB();

    // Prevent destructive category changes from silently breaking products
    const associatedProducts = await Product.countDocuments({ categoryId: id });
    if (associatedProducts > 0) {
      // Instead of hard deleting, deactivate category
      await Category.findByIdAndUpdate(id, { isActive: false });
      return apiSuccess({
        message: `Category deactivated rather than deleted because ${associatedProducts} products reference it.`,
      });
    }

    await Category.findByIdAndDelete(id);
    return apiSuccess({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Category delete error:', error);
    return apiError(error.message || 'Failed to delete category', 500);
  }
}
