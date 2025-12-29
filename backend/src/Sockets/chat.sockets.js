import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";

export default function registerChatHandlers(io, socket) {
  // Every user joins personal room
  socket.join(`user:${socket.user.id}`);

  // Admins join admin room
  if (socket.user.isAdmin) {
    socket.join("admins");
  }

  socket.on("chat:start", async () => {
    try {
      // Find existing conversation
      let conversation = await Conversation.findOne({
        user: socket.user.id,
      });

      // If not exists
      if (!conversation) {
        conversation = await Conversation.create({
          user: socket.user.id,
          status: "open",
        });
      }

      // Join conversation room
      socket.join(`conversation:${conversation._id}`);

      socket.emit("chat:ready", conversation);
    } catch (err) {
      socket.emit("chat:error", "Failed to start chat");
    }
  });

  socket.on("chat:accept", async ({ conversationId }) => {
    try {
      if (!socket.user.isAdmin) return;

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) return;

      // Already assigned?
      if (conversation.assignedAdmin) return;

      conversation.assignedAdmin = socket.user.id;
      conversation.status = "assigned";
      await conversation.save();

      // Admin joins room
      socket.join(`conversation:${conversation._id}`);

      // Create system message
      const systemMessage = await Message.create({
        conversation: conversation._id,
        sender: socket.user.id,
        senderRole: "admin",
        type: "system",
        text: `Your request has been accepted by ${socket.user.name}`,
      });

      // Notify both sides
      io.to(`conversation:${conversation._id}`).emit(
        "chat:system",
        systemMessage
      );
    } catch (err) {
      socket.emit("chat:error", "Failed to accept chat");
    }
  });

  socket.on("chat:message", async ({ conversationId, text }) => {
    try {
      if (!text?.trim()) return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      // Admin restriction only
      if (
        socket.user.isAdmin &&
        conversation.assignedAdmin?.toString() !== socket.user.id
      ) {
        return;
      }

      const message = await Message.create({
        conversation: conversation._id,
        sender: socket.user.id,
        senderRole: socket.user.isAdmin ? "admin" : "user",
        text,
      });

      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      io.to(`conversation:${conversation._id}`).emit("chat:message", message);
    } catch (err) {
      socket.emit("chat:error", "Message failed");
    }
  });

  socket.on("chat:close", async ({ conversationId }) => {
    if (!socket.user.isAdmin) return;

    await Conversation.findByIdAndUpdate(conversationId, {
      status: "closed",
    });

    // no notification to users on close for now
  });
}
