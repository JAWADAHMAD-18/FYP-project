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
      return next(new ApiError("Failed to start chat", 500));
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
      return next(new ApiError("Failed to fetch messages", 500));
    }
  }

  async getAdminConversations(req, res, next) {
    try {
      const conversations = await ChatService.getAdminConversations();
      return ApiResponse.success(res, conversations);
    } catch (err) {
      return next(new ApiError("Failed to fetch conversations", 500));
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
      return next(new ApiError("Failed to fetch conversation", 500));
    }
  }
}

export default new RealtimeChatController();
