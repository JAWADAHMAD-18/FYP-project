import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["open", "assigned", "closed"],
      default: "open",
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    lastMessageAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
