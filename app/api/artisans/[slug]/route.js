import connectDB from '@/lib/mongodb';
import SellerProfile from '@/models/SellerProfile';
import Product from '@/models/Product';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = params;

    const artisan = await SellerProfile.findOne({
      slug,
      applicationStatus: 'approved',
    })
      .populate('userId', 'name avatar email')
      .lean();

    if (!artisan) {
      return apiError('Artisan shop not found', 404);
    }

    const products = await Product.find({
      sellerId: artisan.userId._id,
      status: 'active',
    })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({
      artisan,
      products,
    });
  } catch (error) {
    console.error('Artisan profile error:', error);
    return apiError(error.message || 'Failed to fetch artisan profile', 500);
  }
}
