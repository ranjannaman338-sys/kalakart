import { apiSuccess, handleOptions } from '@/lib/response';

export async function OPTIONS(req) {
  return handleOptions(req);
}

export async function POST(req) {
  const cookieHeader = 'kalakart_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
  return apiSuccess({ message: 'Logged out successfully' }, 200, {
    'Set-Cookie': cookieHeader,
  });
}
