import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    let currentProduct = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      currentProduct = await Product.findById(id);
    } else {
      currentProduct = await Product.findOne({ slug: id });
    }

    if (!currentProduct) {
      return apiError('Product not found', 404);
    }

    const related = await Product.find({
      _id: { $ne: currentProduct._id },
      categoryId: currentProduct.categoryId,
      status: 'active',
    })
      .populate('categoryId', 'name slug')
      .populate('sellerId', 'name avatar')
      .populate('sellerProfileId', 'shopName slug location logo')
      .limit(4)
      .lean();

    return apiSuccess({ products: related });
  } catch (error) {
    console.error('Related products error:', error);
    return apiError(error.message || 'Failed to fetch related products', 500);
  }
}
