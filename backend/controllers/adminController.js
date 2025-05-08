import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUserCredits = async (req, res) => {
  const { userId, credits } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.credits = credits;
    await user.save();

    res.json({ message: "User credits updated", credits: user.credits });
  } catch (error) {
    res.status(500).json({ message: "Failed to update credits" });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const users = await User.find({}, "name email role credits"); // select only needed fields
    const totalCredits = users.reduce((sum, user) => sum + user.credits, 0);

    res.json({
      users,
      totalCredits,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
