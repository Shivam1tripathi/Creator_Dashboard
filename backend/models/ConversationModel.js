// models/Conversation.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to your User model
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false, // false = 1-to-1 chat, true = group chat
    },
    groupName: {
      type: String,
      trim: true,
      default: null, // Only if it's a group chat
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // Helps in showing "latest message" in chats list
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
