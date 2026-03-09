import mongoose from "mongoose";
import Conversation from "../models/Conversation.models.js";
import Message from "../models/message.models.js";

class ChatService {
  
  async getOrCreateConversation(userId) {
    // Use findOneAndUpdate with upsert to prevent race conditions
    // Only return non-closed conversations, create new if none exists
    const conversation = await Conversation.findOneAndUpdate(
      { user: userId, status: { $ne: "closed" } },
      {
        $setOnInsert: {
          user: userId,
          status: "open",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return conversation;
  }

     //FETCH MESSAGES WITH OPTIONAL PAGINATION
  async getMessages(conversationId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    return messages;
  }

 
  async assignAdmin(conversationId, admin) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Atomically update conversation only if not already assigned
      // Use findOneAndUpdate with condition to prevent race condition
      const conversation = await Conversation.findOneAndUpdate(
        {
          _id: conversationId,
          assignedAdmin: null, // Only update if not already assigned
        },
        {
          $set: {
            assignedAdmin: admin.id,
            status: "assigned",
          },
        },
        {
          session,
          new: true,
          runValidators: true,
        }
      );

      if (!conversation) {
        await session.abortTransaction();
        return null;
      }

      // Create system message within transaction
      const [systemMessage] = await Message.create(
        [
          {
            conversation: conversation._id,
            sender: admin.id,
            senderRole: "admin",
            type: "system",
            text: `Your request has been accepted by ${admin.name || "Admin"}`,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return { conversation, systemMessage };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  
  async saveMessage({ conversationId, sender, senderRole, text }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const conversation = await Conversation.findById(conversationId).session(
        session
      );

      if (!conversation) {
        await session.abortTransaction();
        throw new Error("Conversation not found");
      }

      // Check if conversation is closed
      if (conversation.status === "closed") {
        await session.abortTransaction();
        throw new Error("Cannot send message to closed conversation");
      }

      // Validate user owns conversation (for non-admin users)
      if (
        senderRole === "user" &&
        conversation.user.toString() !== sender.id
      ) {
        await session.abortTransaction();
        throw new Error("Unauthorized: You don't own this conversation");
      }

      // Admin restriction
      if (
        senderRole === "admin" &&
        conversation.assignedAdmin?.toString() !== sender.id
      ) {
        await session.abortTransaction();
        throw new Error("Admin not assigned to this conversation");
      }

      // Create message within transaction
      const [message] = await Message.create(
        [
          {
            conversation: conversation._id,
            sender: sender.id,
            senderRole,
            text,
          },
        ],
        { session }
      );

      // Update conversation last message atomically
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
      await conversation.save({ session });

      await session.commitTransaction();
      return message;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // RELEASE/CLOSE CONVERSATION (unassign admin, make available for others)
  async closeConversation(conversationId, admin) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) throw new Error("Conversation not found");

    if (!admin.isAdmin) throw new Error("Only admin can close chat");

    // Only the assigned admin can release the conversation
    const assignedId = conversation.assignedAdmin?.toString?.() ?? conversation.assignedAdmin;
    if (assignedId && assignedId !== admin.id) {
      throw new Error("Only the assigned admin can close this chat");
    }

    // Release: unassign admin and set status back to open so other admins can accept
    conversation.assignedAdmin = null;
    conversation.status = "open";
    await conversation.save();

    return conversation;
  }

  // FETCH ADMIN CONVERSATIONS WITH FILTERS
  async getAdminConversations({
    status = ["open", "assigned", "closed"],
  } = {}) {
    const conversations = await Conversation.find({ status })
      .sort({ updatedAt: -1 })
      .populate("user", "_id name email");

    return conversations;
  }

  // FETCH CONVERSATION WITH MESSAGES
  async getConversationWithMessages(
    conversationId,
    { page = 1, limit = 50 } = {}
  ) {
    const conversation = await Conversation.findById(conversationId).populate(
      "user",
      "_id name email"
    );

    if (!conversation) throw new Error("Conversation not found");

    const messages = await this.getMessages(conversationId, { page, limit });

    return { conversation, messages };
  }

  // VALIDATE CONVERSATION ACCESS HELPER
  async validateConversationAccess(conversationId, userId, isAdmin) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return { valid: false, error: "Conversation not found" };
    }

    if (!isAdmin && conversation.user.toString() !== userId) {
      return { valid: false, error: "Unauthorized: You don't own this conversation" };
    }

    return { valid: true, conversation };
  }
}

export default new ChatService();
