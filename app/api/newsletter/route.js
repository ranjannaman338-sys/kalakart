import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { apiSuccess, apiError, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError('Please enter a valid email address', 422);
    }

    await connectDB();
    await Newsletter.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { email: email.toLowerCase().trim() },
      { upsert: true }
    );

    return apiSuccess({
      message: 'Thank you for subscribing to KalaKart handmade stories and artisan updates!',
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return apiError(error.message || 'Failed to subscribe to newsletter', 500);
  }
}
