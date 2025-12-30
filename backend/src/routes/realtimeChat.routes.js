import { Router } from "express";
import RealtimeChatController from "../controllers/realtimeChat.controllers.js";
import verifyAuth  from "../middleware/auth.middleware.js";

const router = Router();

router.get("/start", verifyAuth, RealtimeChatController.startChat);
router.get(
  "/conversation/:conversationId/messages",
  verifyAuth,
  RealtimeChatController.getMessages
);

router.get(
  "/admin/conversations",
  verifyAuth,
  RealtimeChatController.getAdminConversations
);

router.get(
  "/admin/conversation/:conversationId",
  verifyAuth,
  RealtimeChatController.getConversationWithMessages
);

export default router;
