import AdminUser from '../models/AdminUser.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000,
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required' });

  const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() });
  if (!admin || !bcrypt.compareSync(password, admin.password))
    return res.status(401).json({ success: false, message: 'Invalid email or password' });

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name },
    process.env.SECRET,
    { expiresIn: '8h' }
  );
  res.cookie('admin_token', token, COOKIE_OPTS);
  res.json({ success: true, admin: { id: admin.id, email: admin.email, name: admin.name } });
};

export const logout = (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true, message: 'Logged out' });
};

export const me = (req, res) => {
  res.json({ success: true, admin: req.admin });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() });
  if (!admin)
    return res.json({ success: true, message: 'If this email exists, a reset link has been generated.' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 60 * 60 * 1000;
  await AdminUser.findByIdAndUpdate(admin._id, { resetToken: token, resetTokenExpires: expires });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password?token=${token}`;
  console.log(`[Password Reset URL] ${resetUrl}`);

  res.json({
    success: true,
    message: 'Reset link generated successfully.',
    ...(process.env.NODE_ENV !== 'production' && { resetUrl }),
  });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  if (password.length < 8)
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

  const admin = await AdminUser.findOne({ resetToken: token });
  if (!admin || admin.resetTokenExpires < Date.now())
    return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });

  const hash = bcrypt.hashSync(password, 10);
  await AdminUser.findByIdAndUpdate(admin._id, { password: hash, resetToken: null, resetTokenExpires: null });
  res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
};
