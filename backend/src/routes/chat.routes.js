// import { Router } from 'express';
//  import { chatHandler } from '../controllers/chat.controller.js';
// import { chatLimiter } from '../utills/rateLimiter.utills.js';

// //  import { chatHandler, chatHealthHandler } from '../controllers/chat.controller.js';
// // import { chatLimiter, generalLimiter } from '../utills/rateLimiter.utills.js';


// const router = Router();

// // POST /api/v1/chat  -> { message }
// router.post('/', chatLimiter, chatHandler);

// export default router;
// ============================================
// CHAT ROUTES (ES MODULE VERSION)
// Travel with Jawad - Jawad Tech Group
// ============================================

import express from 'express';

import { 
  handleChat, 
  getSessionHistory, 
  deleteSession,
  healthCheck 
} from '../controllers/chat.controller.js';

const router = express.Router();

// Health check route
router.get('/health', healthCheck);

// Main chat route
router.post('/chat', handleChat);

// Get session history
router.get('/session/:sessionId', getSessionHistory);

// Delete/clear session
router.delete('/session/:sessionId', deleteSession);

export default router;
