import { getAuthUser } from '@/lib/auth';
import SellerProfile from '@/models/SellerProfile';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return apiError('Not authenticated', 401);
    }

    let sellerProfile = null;
    if (user.role === 'seller' || user.role === 'customer') {
      sellerProfile = await SellerProfile.findOne({ userId: user._id });
    }

    return apiSuccess({
      user: user.toJSON(),
      sellerProfile,
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return apiError(error.message || 'Failed to fetch current user', 500);
  }
}
