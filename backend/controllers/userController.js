// controllers/userController.js
import User from "../models/User.js";
import fs from "fs";
import formidable from "formidable";
import mongoose from "mongoose";
import Conversation from "../models/ConversationModel.js";
import Post from "../models/Post.js";

const normalize = (val) => (Array.isArray(val) ? val[0] : val);
const fetchImageBuffer = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
};

export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({
        success: false,
        message: "User ID is required",
      });
    }
    // You can also allow querying by email with req.query.email if needed
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server Error", error });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("followers", "_id") // just count, don’t fetch heavy data
      .populate("following", "_id");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get user posts
    const posts = await Post.find({ user: req.user.id });

    // Aggregate stats
    const totalLikes = posts.reduce((acc, post) => acc + post.likes.length, 0);
    const totalComments = posts.reduce(
      (acc, post) => acc + post.comments.length,
      0
    );

    res.json({
      credits: user.credits,
      followers: user.followers.length,
      following: user.following.length,
      posts: posts.length,
      likes: totalLikes,
      comments: totalComments,
      bio: user.bio || "",
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user._id, // frontend can fetch via /user/profile-picture/:id
      status: user.lastLogin ? "online" : "offline", // OR handle via sockets
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const savePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const user = await User.findById(req.user.id);

    // Check if the post is already saved
    const savedIndex = user.savedPosts.findIndex(
      (p) => p.post.toString() === postId
    );

    if (savedIndex !== -1) {
      // ✅ Unsave post
      user.savedPosts.splice(savedIndex, 1);
      // Optional: adjust credits (subtract if needed)
      user.credits = Math.max(0, user.credits - 2);

      await user.save();
      return res.json({
        msg: "Post unsaved successfully",
        credits: user.credits,
      });
    }

    // ✅ Save the post
    user.savedPosts.push({ post: postId });
    user.credits += 2;

    await user.save();
    res.json({ msg: "Post saved successfully", credits: user.credits });
  } catch (err) {
    console.error("Save post error:", err.message);
    res.status(500).json({ msg: "Failed to save/unsave post" });
  }
};

//get post is saved or not
export const isPostSaved = async (req, res) => {
  try {
    const postId = req.params.pid;

    const user = await User.findById(req.user.id);
    const isSaved = user.savedPosts.some((p) => p.post.toString() === postId);

    res.json({ isSaved });
  } catch (err) {
    console.error("Check saved post error:", err.message);
    res.status(500).json({ msg: "Failed to check if post is saved" });
  }
};

export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate({
        path: "savedPosts.post",
        populate: { path: "user", select: "username profilePicture" },
      })
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Extract populated posts
    const savedPosts = user.savedPosts.map((item) => item.post).filter(Boolean); // remove nulls if post was deleted

    res.status(200).json({
      success: true,
      count: savedPosts.length,
      posts: savedPosts,
    });
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
//complete profile
export const completeProfile = async (req, res) => {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable parse error:", err);
      return res.status(500).json({ msg: "Error parsing form data" });
    }

    try {
      const user = await User.findById(fields.userId);

      if (!user) return res.status(404).json({ msg: "User not found" });
      // Update bio
      let bio = fields.bio;
      if (Array.isArray(bio)) {
        bio = bio.join(" ");
      }

      user.bio = bio || user.bio;

      // Handle profile picture if uploaded
      if (files.profilePicture) {
        const fileData = fs.readFileSync(files.profilePicture[0].filepath);
        user.profilePicture = {
          data: fileData,
          contentType: files.profilePicture[0].mimetype,
        };
      }

      // Award credits if first time
      if (!user.profileCompleted) {
        user.profileCompleted = true;
        user.credits += 15;
      }
      await user.save();

      res.json({
        msg: "Profile marked complete",
        credits: user.credits,
        bio: user.bio,
        profilePicture: user.profilePicture
          ? `data:${
              user.profilePicture.contentType
            };base64,${user.profilePicture.data.toString("base64")}`
          : null,
      });
    } catch (error) {
      console.error("Profile completion error:", error);
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  });
};
export const getCredits = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("credits");
    res.json({ credits: user.credits });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch credits" });
  }
};

export const getUserProfilePictureController = async (req, res) => {
  try {
    const user = await User.findById(req.params.uid).select("profilePicture");

    if (!user || !user.profilePicture || !user.profilePicture.data) {
      return res
        .status(404)
        .send({ success: false, message: "Profile picture not found" });
    }
    res.set("Content-Type", user.profilePicture.contentType);
    return res.status(200).send(user.profilePicture.data);
  } catch (error) {
    console.error("Error loading profile picture:", error);
    return res.status(500).send({
      success: false,
      message: "Error loading profile picture",
      error: error.message,
    });
  }
};

// search user
export const userSearchController = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (!q)
      return res
        .status(400)
        .json({ success: false, msg: "Query ?q= is required" });

    const regex = new RegExp(q, "i");

    const users = await User.find({
      $or: [{ username: regex }, { firstName: regex }, { lastName: regex }],
    }).select("username firstName lastName profilePicture");

    res.json({ success: true, users });
  } catch (err) {
    console.error("User search error:", err);
    res
      .status(500)
      .json({ success: false, msg: "User search failed", error: err.message });
  }
};

// check is following user

export const isFollowingController = async (req, res) => {
  try {
    const { currentuser, checkinguser } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(currentuser) ||
      !mongoose.Types.ObjectId.isValid(checkinguser)
    ) {
      return res.status(400).json({ success: false, msg: "Invalid user IDs" });
    }

    const user = await User.findById(currentuser).select("following");

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const isFollowing = user.following.some(
      (followedUserId) => followedUserId.toString() === checkinguser
    );

    res.status(200).json({ success: true, isFollowing });
  } catch (err) {
    console.error("Follow check error:", err);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

// following controller

export const followUserController = async (req, res) => {
  try {
    const currentUserId = req.user._id; // set by auth middleware
    const targetUserId = req.params.targetId; // /follow/:targetId

    if (currentUserId.equals(targetUserId)) {
      return res
        .status(400)
        .json({ success: false, msg: "You cannot follow yourself." });
    }

    if (
      !mongoose.Types.ObjectId.isValid(currentUserId) ||
      !mongoose.Types.ObjectId.isValid(targetUserId)
    ) {
      return res.status(400).json({ success: false, msg: "Invalid user IDs." });
    }

    // Check current follow state
    const currentUser = await User.findById(currentUserId).select("following");
    const alreadyFollowing = currentUser.following.some((id) =>
      id.equals(targetUserId)
    );

    if (alreadyFollowing) {
      // 🔸 UNFOLLOW: remove each from the other's array
      await Promise.all([
        User.updateOne(
          { _id: currentUserId },
          { $pull: { following: targetUserId } }
        ),
        User.updateOne(
          { _id: targetUserId },
          { $pull: { followers: currentUserId } }
        ),
      ]);

      // 🔸 ALSO DELETE CONVERSATION IF EXISTS
      await Conversation.findOneAndDelete({
        participants: { $all: [currentUserId, targetUserId] },
      });

      return res.json({
        success: true,
        msg: "Unfollowed successfully, conversation deleted if existed.",
        following: false,
      });
    }

    // 🔹 FOLLOW: add if not already following
    await Promise.all([
      User.updateOne(
        { _id: currentUserId },
        { $addToSet: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUserId },
        { $addToSet: { followers: currentUserId } }
      ),
    ]);

    // 🔹 ALSO CREATE CONVERSATION IF DOESN’T EXIST
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, targetUserId],
      });
      await conversation.save();
    }

    res.json({
      success: true,
      msg: "Followed successfully, conversation created if not existed.",
      following: true,
      conversation,
    });
  } catch (err) {
    console.error("Follow/unfollow error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId).select("following");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const excludeIds = [currentUserId, ...currentUser.following];

    // Find users who are not followed by the current user
    const suggestions = await User.aggregate([
      {
        $match: {
          _id: {
            $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      { $sample: { size: 5 } }, // get 5 random suggestions
      {
        $project: {
          username: 1,
          firstName: 1,
          lastName: 1,
          bio: 1,
          followers: 1,
        },
      },
    ]);

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    res.status(500).json({ message: "Failed to fetch suggested users" });
  }
};

export const getTopUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Aggregate users with computed fields
    const users = await User.aggregate([
      {
        $addFields: {
          followersCount: { $size: "$followers" },
          followingCount: { $size: "$following" },
          activityScore: {
            // Recent login adds more weight
            $cond: [
              {
                $gte: [
                  "$lastLogin",
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                ],
              },
              10,
              5,
            ],
          },
        },
      },
      {
        $addFields: {
          // Composite ranking score
          rankScore: {
            $add: [
              { $multiply: ["$followersCount", 0.5] },
              { $multiply: ["$credits", 0.3] },
              {
                $multiply: [
                  {
                    $divide: [
                      "$followersCount",
                      { $add: ["$followingCount", 1] },
                    ],
                  },
                  0.1,
                ],
              },
              { $multiply: ["$activityScore", 0.1] },
            ],
          },
        },
      },
      { $sort: { rankScore: -1 } },
      { $limit: 5 },
    ]);

    // Format response & attach isFollowing flag
    const formattedUsers = users.map((u) => ({
      _id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      username: u.username,
      followersCount: u.followersCount,
      credits: u.credits,
      lastLogin: u.lastLogin,
      rankScore: u.rankScore.toFixed(2),
      isFollowing: u.followers.some(
        (f) => f.toString() === currentUserId.toString()
      ),
    }));

    res.status(200).json({ users: formattedUsers });
  } catch (err) {
    console.error("Top users fetch error:", err);
    res.status(500).json({ message: "Failed to fetch top users" });
  }
};

export const updateProfile = async (req, res) => {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Formidable parse error:", err);
      return res.status(500).json({ msg: "Error parsing form data" });
    }

    try {
      const userId = req.user.id; // 🔑 userId from JWT auth middleware
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // ✅ Update only provided fields
      if (fields.firstName) user.firstName = normalize(fields.firstName);
      if (fields.lastName) user.lastName = normalize(fields.lastName);
      if (fields.username) user.username = normalize(fields.username);
      if (fields.bio) user.bio = normalize(fields.bio);
      if (fields.phoneNumber) user.phoneNumber = normalize(fields.phoneNumber);

      // ✅ Handle profile picture update
      if (files.profilePicture) {
        const fs = await import("fs");
        const fileData = fs.readFileSync(files.profilePicture[0].filepath);
        user.profilePicture = {
          data: fileData,
          contentType: files.profilePicture[0].mimetype,
        };
      }

      await user.save();

      res.status(200).json({
        msg: "Profile updated successfully",
        result: true,
      });
    } catch (err) {
      console.error("❌ Update error:", err);
      res.status(500).json({ msg: "Server error", err });
    }
  });
};
