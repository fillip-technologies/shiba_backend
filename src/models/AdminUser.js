import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  resetToken: { type: String, default: null },
  resetTokenExpires: { type: Number, default: null },
  createdAt: { type: Number, default: () => Date.now() },
}, { timestamps: false });

export default mongoose.model('AdminUser', adminUserSchema);
