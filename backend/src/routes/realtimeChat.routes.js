import { Router } from "express";
import RealtimeChatController from "../controllers/realtimeChat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/start", authMiddleware, RealtimeChatController.startChat);
router.get(
  "/conversation/:conversationId/messages",
  authMiddleware,
  RealtimeChatController.getMessages
);

router.get(
  "/admin/conversations",
  authMiddleware,
  RealtimeChatController.getAdminConversations
);

router.get(
  "/admin/conversation/:conversationId",
  authMiddleware,
  RealtimeChatController.getConversationWithMessages
);

export default router;
