import Conversation from "../models/Conversation.models.js";
import Message from "../models/message.models.js";

class ChatService {
  
  async getOrCreateConversation(userId) {
    let conversation = await Conversation.findOne({ user: userId });

    if (!conversation) {
      conversation = await Conversation.create({
        user: userId,
        status: "open",
      });
    }

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
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || conversation.assignedAdmin) {
      return null;
    }

    conversation.assignedAdmin = admin.id;
    conversation.status = "assigned";
    await conversation.save();

    // system message
    const systemMessage = await Message.create({
      conversation: conversation._id,
      sender: admin.id,
      senderRole: "admin",
      type: "system",
      text: `Your request has been accepted by ${admin.name}`,
    });

    return { conversation, systemMessage };
  }

  
  async saveMessage({ conversationId, sender, senderRole, text }) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) throw new Error("Conversation not found");

    // Admin restriction
    if (
      senderRole === "admin" &&
      conversation.assignedAdmin?.toString() !== sender.id
    ) {
      throw new Error("Admin not assigned to this conversation");
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: sender.id,
      senderRole,
      text,
    });

    // Update conversation last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return message;
  }

  // CLOSE CONVERSATION
  async closeConversation(conversationId, admin) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) throw new Error("Conversation not found");

    if (!admin.isAdmin) throw new Error("Only admin can close chat");

    conversation.status = "closed";
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
}

export default new ChatService();
