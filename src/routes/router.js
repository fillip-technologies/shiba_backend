import { Router } from 'express';
import adminRoutes from './admin.js';
import quotesRoutes from './quotes.js';

const router = Router();

router.use('/api/admin', adminRoutes);
router.use('/api/quotes', quotesRoutes);

export default router;
