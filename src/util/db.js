import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AdminUser from '../models/AdminUser.js';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shibha');
console.log('MongoDB connected');

const exists = await AdminUser.findOne({ email: 'admin@shibhasolar.com' });
if (!exists) {
  const hash = bcrypt.hashSync('Admin@123!', 10);
  await AdminUser.create({ email: 'admin@shibhasolar.com', password: hash, name: 'Admin' });
  console.log('Default admin created — email: admin@shibhasolar.com  password: Admin@123!');
}
