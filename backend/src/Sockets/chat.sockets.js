import ChatService from "../services/chat.service.js";

export default function registerChatHandlers(io, socket) {
  // JOIN USER- AND ADMIN- SPECIFIC ROOMS
  socket.join(`user:${socket.user.id}`);

  if (socket.user.isAdmin) {
    socket.join("admins");
  }

  // START CHAT (USER)
  socket.on("chat:start", async () => {
    try {
      const conversation = await ChatService.getOrCreateConversation(
        socket.user.id
      );

      socket.join(`conversation:${conversation._id}`);
      socket.emit("chat:ready", conversation);
    } catch (err) {
      socket.emit("chat:error", "Failed to start chat");
    }
  });

  // ACCEPT CHAT (ADMIN)
  socket.on("chat:accept", async ({ conversationId }) => {
    try {
      if (!socket.user.isAdmin) return;

      const result = await ChatService.assignAdmin(conversationId, socket.user);

      if (!result) return;

      const { conversation, systemMessage } = result;

      socket.join(`conversation:${conversation._id}`);

      io.to(`conversation:${conversation._id}`).emit(
        "chat:system",
        systemMessage
      );
    } catch (err) {
      socket.emit("chat:error", "Failed to accept chat");
    }
  });

  // SEND MESSAGE (USER OR ADMIN)
  socket.on("chat:message", async ({ conversationId, text }) => {
    try {
      const senderRole = socket.user.isAdmin ? "admin" : "user";

      const message = await ChatService.saveMessage({
        conversationId,
        sender: socket.user,
        senderRole,
        text,
      });

      io.to(`conversation:${conversationId}`).emit("chat:message", message);
    } catch (err) {
      socket.emit("chat:error", err.message || "Message failed");
    }
  });

  // CLOSE CONVERSATION (ADMIN)
  socket.on("chat:close", async ({ conversationId }) => {
    try {
      if (!socket.user.isAdmin) return;

      await ChatService.closeConversation(conversationId, socket.user);

      // Graceful: no emit to user
    } catch (err) {
      socket.emit("chat:error", "Failed to close chat");
    }
  });
}
