import connectDB from '@/lib/mongodb';
import SellerProfile from '@/models/SellerProfile';
import { requireAuth } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const profile = await SellerProfile.findOne({ userId: user._id });
    if (!profile) {
      return apiError('Seller profile not found.', 404);
    }

    return apiSuccess({ profile });
  } catch (error) {
    console.error('Fetch seller profile error:', error);
    return apiError(error.message || 'Failed to fetch seller profile', 500);
  }
}

export async function PATCH(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const profile = await SellerProfile.findOne({ userId: user._id });
    if (!profile) {
      return apiError('Seller profile not found.', 404);
    }

    const body = await req.json();

    // Prevent changing applicationStatus or approvedAt directly
    if (body.shopName) profile.shopName = body.shopName.trim();
    if (body.description) profile.description = body.description;
    if (body.location) profile.location = body.location;
    if (body.logo !== undefined) profile.logo = body.logo;
    if (body.banner !== undefined) profile.banner = body.banner;

    await profile.save();

    return apiSuccess({
      message: 'Shop profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Update seller profile error:', error);
    return apiError(error.message || 'Failed to update seller profile', 500);
  }
}
