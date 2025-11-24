import { Router } from 'express';
import { chatHandler } from '../controllers/chat.controller.js';
import { customPackageLimiter } from '../utills/rateLimiter.utills.js';

const router = Router();

// POST /api/v1/chat  -> { message }
router.post('/', customPackageLimiter, chatHandler);

export default router;
