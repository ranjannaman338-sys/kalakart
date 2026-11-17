// checkAdmin.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(async () => {
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL }).lean();
    console.log('Admin user:', admin);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });
