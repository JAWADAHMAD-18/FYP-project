import express from 'express';
import {
  handleChat,
  getSessionHistory,
  deleteSession,
  healthCheck
} from '../controllers/chatBot.controller.js';
import { chatLimiter, apiLimiter } from '../utills/rateLimiter.utills.js';

const router = express.Router();

// Health check route — skip limiter for load balancers/monitoring
router.get('/health', healthCheck);

// Main chat route — hits Gemini AI
router.post('/chat', chatLimiter, handleChat);

// Session routes — DB lookups
router.get('/session/:sessionId', apiLimiter, getSessionHistory);
router.delete('/session/:sessionId', apiLimiter, deleteSession);

export default router;