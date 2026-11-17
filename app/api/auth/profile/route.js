import { requireAuth } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function PATCH(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();

    if (body.name && typeof body.name === 'string') {
      user.name = body.name.trim();
    }
    if (body.phone !== undefined) {
      user.phone = String(body.phone).trim();
    }
    if (body.avatar !== undefined) {
      user.avatar = String(body.avatar).trim();
    }

    await user.save();

    return apiSuccess({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return apiError(error.message || 'Failed to update profile', 500);
  }
}
