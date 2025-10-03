import { Router } from 'express';
import { getFeatured } from '../controllers/featuredController.js';

const router = Router();

router.get('/', getFeatured);

export default router;