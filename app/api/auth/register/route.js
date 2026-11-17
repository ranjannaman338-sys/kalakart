import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';
import { registerSchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data, errors } = validateBody(registerSchema, body);
    if (errors) {
      return apiError('Validation failed', 422, errors);
    }

    await connectDB();

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return apiError('An account with this email address already exists.', 409);
    }

    const passwordHash = await hashPassword(data.password);

    // Initial role is always customer for security (never trust client-supplied role)
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: 'customer',
      phone: data.phone || '',
      isActive: true,
    });

    const token = signToken({ userId: user._id, role: user.role });

    const cookieHeader = `kalakart_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
      7 * 24 * 60 * 60
    }${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

    return apiSuccess(
      {
        user: user.toJSON(),
        token,
      },
      201,
      { 'Set-Cookie': cookieHeader }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return apiError(error.message || 'Registration failed', 500);
  }
}
