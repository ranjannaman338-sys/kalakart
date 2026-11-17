import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import SellerProfile from '@/models/SellerProfile';
import { comparePassword, signToken } from '@/lib/auth';
import { loginSchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data, errors } = validateBody(loginSchema, body);
    if (errors) {
      return apiError('Invalid email or password format', 422, errors);
    }

    await connectDB();

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return apiError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return apiError('This account has been deactivated. Please contact support.', 403);
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      return apiError('Invalid email or password.', 401);
    }

    let sellerProfile = null;
    if (user.role === 'seller') {
      sellerProfile = await SellerProfile.findOne({ userId: user._id });
    }

    const token = signToken({ userId: user._id, role: user.role });

    const cookieHeader = `kalakart_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
      7 * 24 * 60 * 60
    }${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

    return apiSuccess(
      {
        user: user.toJSON(),
        sellerProfile,
        token,
      },
      200,
      { 'Set-Cookie': cookieHeader }
    );
  } catch (error) {
    console.error('Login error:', error);
    return apiError(error.message || 'Login failed', 500);
  }
}
