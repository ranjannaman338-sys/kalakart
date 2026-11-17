import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function PATCH(req, { params }) {
  try {
    const { user: currentAdmin, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError('Invalid user ID', 400);
    }

    if (id === currentAdmin._id.toString()) {
      return apiError('You cannot modify your own administrative status', 400);
    }

    const body = await req.json();
    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return apiError('User not found', 404);
    }

    if (body.isActive !== undefined) {
      targetUser.isActive = Boolean(body.isActive);
    }
    if (body.role && ['customer', 'seller', 'admin'].includes(body.role)) {
      targetUser.role = body.role;
    }

    await targetUser.save();
    return apiSuccess(targetUser.toJSON());
  } catch (error) {
    console.error('Update user error:', error);
    return apiError(error.message || 'Failed to update user', 500);
  }
}
