import 'dotenv/config';
import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import { hashPassword } from '../lib/auth.js';

async function createAdmin() {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@kalakart.com';
  const password = process.env.ADMIN_INITIAL_PASSWORD || 'AdminSecurePass123!';
  const name = process.env.ADMIN_NAME || 'KalaKart Admin';
  const phone = process.env.ADMIN_PHONE || '+919876543210';

  let admin = await User.findOne({ email });

  if (admin) {
    admin.role = 'admin';
    admin.name = name;
    admin.phone = phone;
    admin.isActive = true;
    admin.passwordHash = await hashPassword(password);
    await admin.save();
    console.log(`[Admin Setup] Updated existing administrator account for: ${email}`);
  } else {
    const passwordHash = await hashPassword(password);
    admin = await User.create({
      name,
      email,
      passwordHash,
      role: 'admin',
      phone,
      isActive: true,
      addresses: [
        {
          name,
          phone,
          street: '12 Heritage Craft Lane',
          city: 'Jaipur',
          state: 'Rajasthan',
          postalCode: '302001',
          country: 'India',
          isDefault: true,
        },
      ],
    });
    console.log(`[Admin Setup] Created new administrator account for: ${email}`);
  }

  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Error creating admin:', err);
  process.exit(1);
});
