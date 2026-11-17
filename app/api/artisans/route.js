import connectDB from '@/lib/mongodb';
import SellerProfile from '@/models/SellerProfile';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    await connectDB();
    const artisans = await SellerProfile.find({ applicationStatus: 'approved' })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ artisans });
  } catch (error) {
    console.error('Artisans error:', error);
    return apiError(error.message || 'Failed to fetch artisans', 500);
  }
}
