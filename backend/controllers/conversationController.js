import Conversation from "../models/ConversationModel.js";

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    }).populate("participants", "firstName lastName email");

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
