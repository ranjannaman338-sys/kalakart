import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import SellerProfile from '@/models/SellerProfile';
import { requireSeller } from '@/lib/permissions';
import { productSchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q')?.trim();
    const category = searchParams.get('category')?.trim();
    const minPrice = parseFloat(searchParams.get('minPrice'));
    const maxPrice = parseFloat(searchParams.get('maxPrice'));
    const minRating = parseFloat(searchParams.get('minRating'));
    const inStock = searchParams.get('inStock');
    const sellerId = searchParams.get('sellerId');
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    const filter = { status: 'active' };

    // Search query
    if (q) {
      // Find matching categories or sellers first for enriched search
      const matchingCats = await Category.find({ name: { $regex: q, $options: 'i' } }).select('_id');
      const catIds = matchingCats.map((c) => c._id);

      const matchingProfiles = await SellerProfile.find({ shopName: { $regex: q, $options: 'i' } }).select('userId');
      const sellerUserIds = matchingProfiles.map((s) => s.userId);

      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { materials: { $regex: q, $options: 'i' } },
        { categoryId: { $in: catIds } },
        { sellerId: { $in: sellerUserIds } },
      ];
    }

    // Category filter (support slug or ObjectId)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.categoryId = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          filter.categoryId = catDoc._id;
        } else {
          return apiSuccess({ products: [], total: 0, page, totalPages: 0, limit });
        }
      }
    }

    // Price range
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }

    // Rating
    if (!isNaN(minRating) && minRating > 0) {
      filter.averageRating = { $gte: minRating };
    }

    // In Stock
    if (inStock === 'true' || inStock === '1') {
      filter.stock = { $gt: 0 };
    }

    // Seller ID
    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
      filter.sellerId = sellerId;
    }

    // Sorting
    let sortQuery = { createdAt: -1 };
    if (sort === 'price-low') {
      sortQuery = { price: 1 };
    } else if (sort === 'price-high') {
      sortQuery = { price: -1 };
    } else if (sort === 'rating') {
      sortQuery = { averageRating: -1, reviewCount: -1 };
    } else if (sort === 'featured') {
      sortQuery = { averageRating: -1, reviewCount: -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('categoryId', 'name slug')
        .populate('sellerId', 'name avatar')
        .populate('sellerProfileId', 'shopName slug location logo')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return apiSuccess({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return apiError(error.message || 'Failed to fetch products', 500);
  }
}

export async function POST(req) {
  try {
    const { user, sellerProfile, errorResponse } = await requireSeller(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { data, errors } = validateBody(productSchema, body);
    if (errors) {
      return apiError('Validation failed', 422, errors);
    }

    await connectDB();

    // Verify category exists
    const categoryExists = await Category.findById(data.categoryId);
    if (!categoryExists) {
      return apiError('Selected category does not exist.', 404);
    }

    // Generate unique slug
    let baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newProduct = await Product.create({
      ...data,
      slug,
      sellerId: user._id,
      sellerProfileId: sellerProfile ? sellerProfile._id : null,
      status: data.status || 'active',
      averageRating: 0,
      reviewCount: 0,
    });

    const populated = await Product.findById(newProduct._id)
      .populate('categoryId', 'name slug')
      .populate('sellerId', 'name avatar')
      .populate('sellerProfileId', 'shopName slug location logo');

    return apiSuccess(populated, 201);
  } catch (error) {
    console.error('Product create error:', error);
    return apiError(error.message || 'Failed to create product', 500);
  }
}
