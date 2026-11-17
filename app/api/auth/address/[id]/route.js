import { requireAuth } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function DELETE(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const addressId = params.id;
    user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);
    await user.save();

    return apiSuccess({
      message: 'Address removed successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    return apiError(error.message || 'Failed to remove address', 500);
  }
}

export async function PATCH(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const addressId = params.id;
    const body = await req.json();

    if (body.setDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = a._id.toString() === addressId;
      });
      await user.save();
    }

    return apiSuccess({
      message: 'Address updated successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    return apiError(error.message || 'Failed to update address', 500);
  }
}
