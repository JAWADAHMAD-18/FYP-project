import mongoose from "mongoose";
import ChatService from "../services/chat.service.js";

export default function registerChatHandlers(io, socket) {
  // JOIN USER- AND ADMIN- SPECIFIC ROOMS
  socket.join(`user:${socket.user.id}`);

  if (socket.user.isAdmin) {
    socket.join("admins");
  }

  // TYPING INDICATORS (USER OR ADMIN)
  socket.on("chat:typing", async ({ conversationId }) => {
    if (socket.rateLimitCheck && !(await socket.rateLimitCheck())) {
      return;
    }

    try {
      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        return socket.emit("chat:error", "Invalid conversation ID");
      }

      const accessCheck = await ChatService.validateConversationAccess(
        conversationId,
        socket.user.id,
        socket.user.isAdmin
      );

      if (!accessCheck.valid) {
        return socket.emit("chat:error", accessCheck.error);
      }

      const senderRole = socket.user.isAdmin ? "admin" : "user";

      io.to(`conversation:${conversationId}`).emit("chat:typing", {
        conversationId,
        senderRole,
      });
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        console.error(`[chat:typing] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
        });
      } else {
        console.error(`[chat:typing] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
          stack: err.stack,
        });
      }
    }
  });

  socket.on("chat:stopTyping", async ({ conversationId }) => {
    if (socket.rateLimitCheck && !(await socket.rateLimitCheck())) {
      return;
    }

    try {
      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        return socket.emit("chat:error", "Invalid conversation ID");
      }

      const accessCheck = await ChatService.validateConversationAccess(
        conversationId,
        socket.user.id,
        socket.user.isAdmin
      );

      if (!accessCheck.valid) {
        return socket.emit("chat:error", accessCheck.error);
      }

      const senderRole = socket.user.isAdmin ? "admin" : "user";

      io.to(`conversation:${conversationId}`).emit("chat:stopTyping", {
        conversationId,
        senderRole,
      });
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        console.error(`[chat:stopTyping] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
        });
      } else {
        console.error(`[chat:stopTyping] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
          stack: err.stack,
        });
      }
    }
  });

  // JOIN EXISTING CONVERSATION ROOM (USER OR ADMIN)
  socket.on("chat:join", async ({ conversationId }) => {
    // Rate limiting check
    if (socket.rateLimitCheck && !(await socket.rateLimitCheck())) {
      return;
    }

    try {
      // Validate conversationId format
      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        return socket.emit("chat:error", "Invalid conversation ID");
      }

      // Validate conversation access
      const accessCheck = await ChatService.validateConversationAccess(
        conversationId,
        socket.user.id,
        socket.user.isAdmin
      );

      if (!accessCheck.valid) {
        return socket.emit("chat:error", accessCheck.error);
      }

      socket.join(`conversation:${conversationId}`);
    } catch (err) {
      // Sanitized error logging for production
      if (process.env.NODE_ENV === "production") {
        console.error(`[chat:join] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
        });
      } else {
        console.error(`[chat:join] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
          stack: err.stack,
        });
      }
      socket.emit("chat:error", err.message || "Failed to join conversation");
    }
  });

  // START CHAT (USER)
  socket.on("chat:start", async () => {
    // Rate limiting check
    if (socket.rateLimitCheck && !(await socket.rateLimitCheck())) {
      return;
    }
    try {
      const conversation = await ChatService.getOrCreateConversation(
        socket.user.id
      );

      socket.join(`conversation:${conversation._id}`);
      socket.emit("chat:ready", conversation);

      // Notify all admins of new conversation
      io.to("admins").emit("conversation:new", {
        conversationId: conversation._id,
        userId: socket.user.id,
        status: conversation.status,
      });
    } catch (err) {
      // Sanitized error logging for production
      if (process.env.NODE_ENV === "production") {
        console.error(`[chat:start] Error:`, {
          userId: socket.user.id,
          error: err.message,
        });
      } else {
        console.error(`[chat:start] Error:`, {
          userId: socket.user.id,
          error: err.message,
          stack: err.stack,
        });
      }
      socket.emit("chat:error", err.message || "Failed to start chat");
    }
  });

  // ACCEPT CHAT (ADMIN)
  socket.on("chat:accept", async ({ conversationId }) => {
    // Rate limiting check
    if (socket.rateLimitCheck && !(await socket.rateLimitCheck())) {
      return;
    }
    try {
      if (!socket.user.isAdmin) {
        return socket.emit("chat:error", "Only admins can accept conversations");
      }

      // Validate conversationId format
      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        return socket.emit("chat:error", "Invalid conversation ID");
      }

      const result = await ChatService.assignAdmin(conversationId, socket.user);

      if (!result) {
        return socket.emit(
          "chat:error",
          "Conversation already assigned or not found"
        );
      }

      const { conversation, systemMessage } = result;

      socket.join(`conversation:${conversation._id}`);

      io.to(`conversation:${conversation._id}`).emit(
        "chat:system",
        systemMessage
      );
    } catch (err) {
      // Sanitized error logging for production
      if (process.env.NODE_ENV === "production") {
        console.error(`[chat:accept] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
        });
      } else {
        console.error(`[chat:accept] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
          stack: err.stack,
        });
      }
      socket.emit("chat:error", err.message || "Failed to accept chat");
    }
  });

  // SEND MESSAGE (USER OR ADMIN)
  socket.on("chat:message", async ({ conversationId, text }) => {
    // Rate limiting check
    if (socket.rateLimitCheck && !(await socket.rateLimitCheck())) {
      return;
    }
    try {
      // Input validation
      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        return socket.emit("chat:error", "Invalid conversation ID");
      }

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return socket.emit("chat:error", "Message cannot be empty");
      }

      if (text.length > 5000) {
        return socket.emit("chat:error", "Message too long (max 5000 characters)");
      }

      // Validate conversation access
      const accessCheck = await ChatService.validateConversationAccess(
        conversationId,
        socket.user.id,
        socket.user.isAdmin
      );

      if (!accessCheck.valid) {
        return socket.emit("chat:error", accessCheck.error);
      }

      const senderRole = socket.user.isAdmin ? "admin" : "user";

      const message = await ChatService.saveMessage({
        conversationId,
        sender: socket.user,
        senderRole,
        text: text.trim(),
      });

      io.to(`conversation:${conversationId}`).emit("chat:message", message);
      // Notify all admins so unread counts and toasts work even when admin hasn't joined that conversation yet
      io.to("admins").emit("chat:message", message);
    } catch (err) {
      // Sanitized error logging for production
      if (process.env.NODE_ENV === "production") {
        console.error(`[chat:message] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
        });
      } else {
        console.error(`[chat:message] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
          stack: err.stack,
        });
      }
      socket.emit("chat:error", err.message || "Message failed");
    }
  });

  // CLOSE CONVERSATION (ADMIN)
  socket.on("chat:close", async ({ conversationId }) => {
    // Rate limiting check
    if (socket.rateLimitCheck && !(await socket.rateLimitCheck())) {
      return;
    }
    try {
      if (!socket.user.isAdmin) {
        return socket.emit("chat:error", "Only admins can close conversations");
      }

      // Validate conversationId format
      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        return socket.emit("chat:error", "Invalid conversation ID");
      }

      await ChatService.closeConversation(conversationId, socket.user);

      // Notify conversation participants
      io.to(`conversation:${conversationId}`).emit("chat:closed", {
        conversationId,
        closedBy: socket.user.id,
      });
    } catch (err) {
      // Sanitized error logging for production
      if (process.env.NODE_ENV === "production") {
        console.error(`[chat:close] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
        });
      } else {
        console.error(`[chat:close] Error:`, {
          userId: socket.user.id,
          conversationId,
          error: err.message,
          stack: err.stack,
        });
      }
      socket.emit("chat:error", err.message || "Failed to close chat");
    }
  });
}
