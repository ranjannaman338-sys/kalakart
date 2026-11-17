import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from './mongodb.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kalakart_super_secret_jwt_key_handcrafted_with_love_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export async function comparePassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function getTokenFromRequest(req) {
  // Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Check cookies
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, decodeURIComponent(v.join('='))];
      })
    );
    if (cookies.kalakart_token) {
      return cookies.kalakart_token;
    }
  }

  return null;
}

export async function getAuthUser(req) {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) return null;

  await connectDB();
  const user = await User.findById(decoded.userId).select('-passwordHash');
  if (!user || !user.isActive) return null;

  return user;
}
