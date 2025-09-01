import Conversation from "../models/ConversationModel.js";
import MessagesModel from "../models/MessagesModel.js";

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, sender, text } = req.body;
    const newMessage = new MessagesModel({
      conversationId,
      sender,
      text,
    });
    await newMessage.save();

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get paginated messages in a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    let { page, limit } = req.query;

    // Defaults
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 15;

    const skip = (page - 1) * limit;

    // Count total messages in this conversation
    const totalMessages = await MessagesModel.countDocuments({
      conversationId,
    });

    // Fetch messages (latest first)
    let messages = await MessagesModel.find({ conversationId })
      .populate("sender", "firstName lastName email username profilePic")
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    // Reverse so they display oldest → newest (chat style)
    messages = messages.reverse();

    res.status(200).json({
      totalMessages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
