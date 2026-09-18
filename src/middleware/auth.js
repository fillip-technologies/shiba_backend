import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const token = req.cookies.admin_token ||
    (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.slice(7));

  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    req.admin = jwt.verify(token, process.env.SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
};
