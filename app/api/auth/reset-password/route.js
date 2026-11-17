import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { resetPasswordSchema, validateBody } from '@/lib/validation';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data, errors } = validateBody(resetPasswordSchema, body);
    if (errors) {
      return apiError('Validation failed', 422, errors);
    }

    await connectDB();

    const hashedToken = crypto.createHash('sha256').update(data.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return apiError('Password reset token is invalid or has expired.', 400);
    }

    user.passwordHash = await hashPassword(data.newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return apiSuccess({
      message: 'Your password has been successfully reset. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return apiError(error.message || 'Unable to reset password', 500);
  }
}
