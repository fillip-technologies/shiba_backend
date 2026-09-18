import { Router } from 'express';
import auth from '../middleware/auth.js';
import { login, logout, me, forgotPassword, resetPassword } from '../controllers/admin.js';
import wrap from '../util/asyncHandler.js';

const router = Router();

router.post('/login', wrap(login));
router.post('/logout', auth, logout);
router.get('/me', auth, me);
router.post('/forgot-password', wrap(forgotPassword));
router.post('/reset-password', wrap(resetPassword));

export default router;
