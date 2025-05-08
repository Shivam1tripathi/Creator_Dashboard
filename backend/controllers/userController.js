// controllers/userController.js
import User from "../models/User.js";

export const getDashboard = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    credits: user.credits,
    savedPosts: user.savedPosts,
    reportedPosts: user.reportedPosts,
    ProfileComplete: user.profileCompleted,
  });
};

export const savePost = async (req, res) => {
  try {
    const { post } = req.body;
    const { title, image, link } = post;

    const user = await User.findById(req.user.id);

    const alreadySaved = user.savedPosts.some((p) => p.link === link);
    if (alreadySaved) {
      return res.status(400).json({ msg: "Post already saved" });
    }

    user.savedPosts.push({ title, image, link });
    user.credits += 2;
    await user.save();

    res.json({ msg: "Post saved", credits: user.credits });
  } catch (err) {
    console.error("Save post error:", err.message);
    res.status(500).json({ msg: "Failed to save post" });
  }
};
export const reportPost = async (req, res) => {
  try {
    const { post } = req.body;
    const { title, image, link } = post;

    const user = await User.findById(req.user.id);

    const alreadyReported = user.reportedPosts.some((p) => p.link === link);
    if (alreadyReported) {
      return res.status(400).json({ msg: "Post already reported" });
    }

    user.reportedPosts.push({ title, image, link });
    user.credits += 10;
    await user.save();

    res.json({ msg: "Post reported", credits: user.credits });
  } catch (err) {
    console.error("Report post error:", err.message);
    res.status(500).json({ msg: "Failed to report post" });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const { bio, skills } = req.body;

    // Update bio and skills
    user.bio = bio || user.bio;
    user.skills = skills;

    // If profile is not completed yet, award credits
    if (!user.profileCompleted) {
      user.profileCompleted = true;
      user.credits += 15;
    }

    await user.save();

    res.json({
      msg: "Profile marked complete",
      credits: user.credits,
      bio: user.bio,
      skills: user.skills,
    });
  } catch (err) {
    console.error("Profile completion error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const getCredits = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("credits");
    res.json({ credits: user.credits });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch credits" });
  }
};
