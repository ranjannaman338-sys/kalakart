import connectDB from '@/lib/mongodb';
import SellerProfile from '@/models/SellerProfile';
import User from '@/models/User';
import { requireAuth } from '@/lib/permissions';
import { sellerApplySchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { data, errors } = validateBody(sellerApplySchema, body);
    if (errors) {
      return apiError('Validation failed', 422, errors);
    }

    await connectDB();

    const existingProfile = await SellerProfile.findOne({ userId: user._id });
    if (existingProfile) {
      return apiError(
        `You have already submitted an application (Status: ${existingProfile.applicationStatus}).`,
        409
      );
    }

    let baseSlug = data.shopName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await SellerProfile.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const profile = await SellerProfile.create({
      userId: user._id,
      shopName: data.shopName,
      slug,
      description: data.description,
      location: data.location,
      logo: data.logo || '',
      banner: data.banner || '',
      applicationStatus: 'pending',
    });

    // Update user role to seller
    user.role = 'seller';
    await user.save();

    return apiSuccess(
      {
        message: 'Your artisan seller application has been submitted and is pending administrator review.',
        profile,
      },
      201
    );
  } catch (error) {
    console.error('Seller apply error:', error);
    return apiError(error.message || 'Failed to submit application', 500);
  }
}
