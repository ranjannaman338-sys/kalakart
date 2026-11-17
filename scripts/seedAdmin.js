import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env manually so we don't need dotenv dep
const envPath = resolve(__dirname, '../.env');
const envVars = {};
readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) envVars[key.trim()] = rest.join('=').trim();
});

const MONGODB_URI = envVars.MONGODB_URI;
const ADMIN_EMAIL = envVars.ADMIN_EMAIL;
const ADMIN_PASSWORD = envVars.ADMIN_INITIAL_PASSWORD;
const ADMIN_NAME = envVars.ADMIN_NAME;
const ADMIN_PHONE = envVars.ADMIN_PHONE || '';

console.log('Using URI:', MONGODB_URI);
console.log('Admin email:', ADMIN_EMAIL);

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  addresses: { type: Array, default: [] },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    name: ADMIN_NAME || 'Admin',
    email: ADMIN_EMAIL,
    passwordHash,
    role: 'admin',
    phone: ADMIN_PHONE,
    isActive: true,
  });
  console.log('Admin created:', ADMIN_EMAIL);
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
