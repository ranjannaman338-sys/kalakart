import { requireAuth } from '@/lib/permissions';
import { addressSchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    return apiSuccess({ addresses: user.addresses || [] });
  } catch (error) {
    return apiError(error.message || 'Failed to fetch addresses', 500);
  }
}

export async function POST(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { data, errors } = validateBody(addressSchema, body);
    if (errors) {
      return apiError('Validation failed', 422, errors);
    }

    // If marked as default or first address, unset previous default
    if (data.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      data.isDefault = true;
    }

    user.addresses.push(data);
    await user.save();

    return apiSuccess({
      message: 'Address added successfully',
      addresses: user.addresses,
    }, 201);
  } catch (error) {
    console.error('Add address error:', error);
    return apiError(error.message || 'Failed to add address', 500);
  }
}
