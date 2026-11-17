import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import SellerProfile from '@/models/SellerProfile';
import User from '@/models/User';
import { requireAdmin } from '@/lib/permissions';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function PATCH(req, { params }) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError('Invalid seller profile ID', 400);
    }

    const body = await req.json();
    const { status, rejectionReason = '' } = body;

    const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return apiError('Invalid application status', 400);
    }

    await connectDB();
    const profile = await SellerProfile.findById(id);
    if (!profile) {
      return apiError('Seller profile not found', 404);
    }

    profile.applicationStatus = status;

    if (status === 'approved') {
      profile.approvedAt = new Date();
      profile.rejectionReason = '';
      // Ensure User role is 'seller'
      await User.findByIdAndUpdate(profile.userId, { role: 'seller' });
    } else if (status === 'rejected') {
      profile.rejectionReason = rejectionReason || 'Application does not meet current artisan criteria.';
      // User role reverts to 'customer'
      await User.findByIdAndUpdate(profile.userId, { role: 'customer' });
    } else if (status === 'suspended') {
      profile.rejectionReason = rejectionReason || 'Account suspended by administrator.';
    }

    await profile.save();

    const updated = await SellerProfile.findById(id).populate('userId', 'name email phone avatar');

    return apiSuccess({
      message: `Seller status updated to ${status}`,
      profile: updated,
    });
  } catch (error) {
    console.error('Update seller status error:', error);
    return apiError(error.message || 'Failed to update seller status', 500);
  }
}
