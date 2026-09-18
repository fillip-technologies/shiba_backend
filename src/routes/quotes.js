import { Router } from 'express';
import auth from '../middleware/auth.js';
import { submitQuote, getQuotes, updateQuoteStatus, deleteQuote } from '../controllers/quotes.js';
import wrap from '../util/asyncHandler.js';

const router = Router();

router.post('/', wrap(submitQuote));
router.get('/', auth, wrap(getQuotes));
router.patch('/:id/status', auth, wrap(updateQuoteStatus));
router.delete('/:id', auth, wrap(deleteQuote));

export default router;
