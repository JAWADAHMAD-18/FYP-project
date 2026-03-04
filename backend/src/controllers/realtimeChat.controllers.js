import ChatService from "../services/chat.service.js";
import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";

class RealtimeChatController {
  async startChat(req, res, next) {
    try {
      const conversation = await ChatService.getOrCreateConversation(
        req.user.id
      );
      return ApiResponse.success(res, conversation);
    } catch (err) {
      // Log the real cause for debugging
      // eslint-disable-next-line no-console
      console.error("[RealtimeChatController.startChat] error:", err);
      return next(
        new ApiError(500, err?.message || "Failed to start chat")
      );
    }
  }

  async getMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const messages = await ChatService.getMessages(conversationId, {
        page: Number(page),
        limit: Number(limit),
      });
      return ApiResponse.success(res, messages);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        "[RealtimeChatController.getMessages] error:",
        err
      );
      return next(
        new ApiError(500, err?.message || "Failed to fetch messages")
      );
    }
  }

  async getAdminConversations(req, res, next) {
    try {
      // Ensure only authenticated admins can access this endpoint
      if (!req.user) {
        return next(new ApiError(401, "User not authenticated"));
      }
      if (!req.user.isAdmin) {
        return next(
          new ApiError(403, "Only admins can access conversations")
        );
      }

      const conversations = await ChatService.getAdminConversations();
      return ApiResponse.success(res, conversations);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        "[RealtimeChatController.getAdminConversations] error:",
        err
      );
      return next(
        new ApiError(500, err?.message || "Failed to fetch conversations")
      );
    }
  }

  async getConversationWithMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const result = await ChatService.getConversationWithMessages(
        conversationId,
        {
          page: Number(page),
          limit: Number(limit),
        }
      );
      return ApiResponse.success(res, result);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        "[RealtimeChatController.getConversationWithMessages] error:",
        err
      );
      return next(
        new ApiError(500, err?.message || "Failed to fetch conversation")
      );
    }
  }
}

export default new RealtimeChatController();
