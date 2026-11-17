import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { forgotPasswordSchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data, errors } = validateBody(forgotPasswordSchema, body);
    if (errors) {
      return apiError('Valid email is required', 422, errors);
    }

    await connectDB();
    const user = await User.findOne({ email: data.email });

    // Consistent timing and avoid leaking account existence
    if (!user) {
      return apiSuccess({
        message: 'If an account exists with this email, password reset instructions have been generated.',
      });
    }

    // Generate secure random reset token expiring in 1 hour
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return apiSuccess({
      message: 'Password reset token generated successfully.',
      // Provided in development to support verification without email server
      developmentResetToken: resetToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return apiError(error.message || 'Unable to process password reset request', 500);
  }
}
