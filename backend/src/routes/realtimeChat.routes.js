import { Router } from "express";
import RealtimeChatController from "../controllers/realtimeChat.controllers.js";
import verifyAuth  from "../middleware/auth.middleware.js";
import { chatLimiter, apiLimiter } from "../utills/rateLimiter.utills.js";

const router = Router();

// Start a new chat session — potential for abuse if many sessions are opened
router.get("/start", chatLimiter, verifyAuth, RealtimeChatController.startChat);

// Retrieve messages for a conversation — DB lookup
router.get(
  "/conversation/:conversationId/messages",
  apiLimiter,
  verifyAuth,
  RealtimeChatController.getMessages
);

// Admin: Get all conversations — DB lookup
router.get(
  "/admin/conversations",
  apiLimiter,
  verifyAuth,
  RealtimeChatController.getAdminConversations
);

// Admin: Get specific conversation with messages — DB lookup
router.get(
  "/admin/conversation/:conversationId",
  apiLimiter,
  verifyAuth,
  RealtimeChatController.getConversationWithMessages
);

export default router;
