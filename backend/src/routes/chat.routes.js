// ============================================
// CHAT ROUTES
// Travel with Jawad - Jawad Tech Group
// ============================================

import express from 'express';
const router = express.Router();

import {
  handleChat,
  getSessionHistory,
  deleteSession,
  healthCheck
} from '../controllers/chat.controller.js';

// Health check route
router.get('/health', healthCheck);

// Main chat route
router.post('/chat', handleChat);

// Get session history
router.get('/session/:sessionId', getSessionHistory);

// Delete/clear session
router.delete('/session/:sessionId', deleteSession);

export default router;