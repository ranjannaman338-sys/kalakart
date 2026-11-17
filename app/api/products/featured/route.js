import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    await connectDB();

    const featuredProducts = await Product.find({ status: 'active' })
      .populate('categoryId', 'name slug')
      .populate('sellerId', 'name avatar')
      .populate('sellerProfileId', 'shopName slug location logo')
      .sort({ averageRating: -1, reviewCount: -1, createdAt: -1 })
      .limit(8)
      .lean();

    return apiSuccess({ products: featuredProducts });
  } catch (error) {
    console.error('Featured products error:', error);
    return apiError(error.message || 'Failed to fetch featured products', 500);
  }
}
