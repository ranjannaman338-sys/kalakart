import { getAuthUser } from './auth.js';
import { apiError } from './response.js';
import SellerProfile from '../models/SellerProfile.js';

export async function requireAuth(req) {
  const user = await getAuthUser(req);
  if (!user) {
    return {
      user: null,
      errorResponse: apiError('Authentication required. Please sign in.', 401),
    };
  }
  return { user, errorResponse: null };
}

export async function requireSeller(req) {
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return { user: null, sellerProfile: null, errorResponse };

  // Admin can also manage seller features if needed, but primary is seller
  if (user.role === 'admin') {
    return { user, sellerProfile: null, errorResponse: null, isAdmin: true };
  }

  if (user.role !== 'seller') {
    return {
      user,
      sellerProfile: null,
      errorResponse: apiError('Access denied. Seller account required.', 403),
    };
  }

  const sellerProfile = await SellerProfile.findOne({ userId: user._id });
  if (!sellerProfile) {
    return {
      user,
      sellerProfile: null,
      errorResponse: apiError('Seller profile not found. Please apply first.', 404),
    };
  }

  if (sellerProfile.applicationStatus !== 'approved') {
    return {
      user,
      sellerProfile,
      errorResponse: apiError(
        `Seller account status is ${sellerProfile.applicationStatus}. Approved status required.`,
        403
      ),
    };
  }

  return { user, sellerProfile, errorResponse: null, isAdmin: false };
}

export async function requireAdmin(req) {
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return { user: null, errorResponse };

  if (user.role !== 'admin') {
    return {
      user,
      errorResponse: apiError('Access denied. Administrator privileges required.', 403),
    };
  }

  return { user, errorResponse: null };
}
