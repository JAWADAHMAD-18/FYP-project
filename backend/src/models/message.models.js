import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    senderRole: {
      type: String,
      enum: ["user", "admin", "ai"],
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "system"],
      default: "text",
    },

    text: {
      type: String,
      required: true,
    },

    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
