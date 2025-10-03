import { Router } from 'express';
import { body } from 'express-validator';
import { upsertReview, deleteReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('agentId').notEmpty().withMessage('agentId is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isLength({ max: 500 }).withMessage('Comment too long')
  ],
  upsertReview
);

router.delete('/:id', authenticate, deleteReview);

export default router;