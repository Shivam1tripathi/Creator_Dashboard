import Post from "../models/Post.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cloudinary from "../config/cloudinary.js";
const storage = multer.diskStorage({});
export const upload = multer({ storage });

export const createPostController = async (req, res) => {
  try {
    const { type, caption, tags } = req.fields;
    const { content } = req.files;

    // Validation
    if (!type)
      return res.status(400).send({ message: "Post type is required" });
    if (!content)
      return res.status(400).send({ message: "Post content is required" });

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(content.path, {
      folder: "posts",
      resource_type: type === "video" ? "video" : "image",
    });

    // Create Post
    const post = new Post({
      user: req.user._id,
      type,
      caption,
      tags: tags ? tags.split(",") : [],
      content: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        resource_type: uploadResult.resource_type,
      },
    });

    await post.save();

    // Delete temp file
    fs.unlinkSync(content.path);

    res.status(201).send({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error creating post",
      error: error.message,
    });
  }
};

//get user by post id
export const getUserbypostid = async (req, res) => {
  try {
    const { pid } = req.params;

    // Find the post by ID and populate the user field
    const post = await Post.findById(pid).populate(
      "user",
      "firstName lastName username profilePicture"
    );

    if (!post) {
      return res.status(404).send({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "User fetched by post ID successfully",
      user: post.user,
    });
  } catch (error) {
    console.error("Error fetching user by postid", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch user",
      error,
    });
  }
};

//get single post by post id
export const getSinglePostController = async (req, res) => {
  try {
    const postId = req.params.pid;

    const post = await Post.findById(postId).select("-content"); // exclude binary data (load separately if needed)

    if (!post) {
      return res.status(404).send({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Post fetched successfully",
      post,
    });
  } catch (error) {
    console.error("Error getting post:", error);
    res.status(500).send({
      success: false,
      message: "Error getting post",
      error: error.message,
    });
  }
};

// GET /api/post/user/:uid
export const getAllPostsByUserController = async (req, res) => {
  try {
    const { uid } = req.params;

    const posts = await Post.find({ user: uid })
      .select("-content")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "User posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Error fetching user posts", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user posts",
      error: error.message,
    });
  }
};

//get post content
export const getPostContentController = async (req, res) => {
  try {
    const id = req.params.pid;

    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Post ID is required",
      });
    }

    // Fetch post
    const post = await Post.findById(id).select("content");

    if (!post || !post.content || !post.content.url) {
      return res.status(404).send({
        success: false,
        message: "Post content not found",
      });
    }

    // Instead of streaming binary, just return the Cloudinary URL
    res.status(200).send({
      success: true,
      message: "Post content fetched successfully",
      contentUrl: post.content.url,
      resourceType: post.content.resource_type,
    });
  } catch (error) {
    console.error("Error fetching post content:", error);
    return res.status(500).send({
      success: false,
      message: "Error loading content",
      error: error.message,
    });
  }
};

// Delete Post
export const deletePostController = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.pid);
    res.status(200).send({ success: true, message: "Post deleted" });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Error deleting post", error });
  }
};

// creating comment in post
export const addPostComment = async (req, res) => {
  try {
    const postId = req.params.pid;

    const { text } = req.body;

    const userId = req.user._id; // Assuming auth middleware sets req.user
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    post.comments.unshift({ user: userId, text }); // unshift for newest first
    await post.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comments: post.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    });
  }
};
//geting all comments of a post
export const getPostComments = async (req, res) => {
  try {
    const postId = req.params.pid;

    const post = await Post.findById(postId)
      .populate("comments.user", "username profilePicture") // populate comment authors
      .select("comments");

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    res.status(200).json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

// Toggle like/unlike on a post
export const togglePostLike = async (req, res) => {
  try {
    const postId = req.params.pid;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.some(
      (like) => like.user.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Unlike → remove user object
      post.likes = post.likes.filter(
        (like) => like.user.toString() !== userId.toString()
      );
    } else {
      // Like → add with timestamp
      post.likes.push({ user: userId, createdAt: new Date() });
    }

    await post.save();

    return res.status(200).json({
      success: true,
      totalLikes: post.likes.length,
      message: alreadyLiked ? "Post unliked" : "Post liked",
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({
      success: false,
      message: "Error toggling like",
      error: error.message,
    });
  }
};

// Get number of likes on a post
export const getPostLikesCount = async (req, res) => {
  try {
    const postId = req.params.pid;

    const post = await Post.findById(postId).select("likes");
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      likesCount: post.likes.length,
      likes: post.likes, // optional: returns array with { user, createdAt }
    });
  } catch (error) {
    console.error("Error getting likes count:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting likes count",
      error: error.message,
    });
  }
};

// Current user liked this post
export const isPostLiked = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const isLiked = post.likes.some(
      (like) => like.user.toString() === userId.toString()
    );

    res.json({ isLiked });
  } catch (err) {
    console.error("Check liked post error:", err.message);
    res.status(500).json({ msg: "Failed to check if post is liked" });
  }
};

//search post

export const postSearchController = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q)
      return res
        .status(400)
        .json({ success: false, msg: "Query ?q= is required" });

    const regex = new RegExp(q, "i");

    const posts = await Post.find({
      $or: [{ caption: regex }, { tags: regex }],
    })
      .select("-content")
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, posts });
  } catch (err) {
    console.error("Post search error:", err);
    res
      .status(500)
      .json({ success: false, msg: "Post search failed", error: err.message });
  }
};

export const getTrendingVideos = async (req, res) => {
  try {
    const videos = await Post.find({ type: "video" })
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .lean();

    const now = Date.now();
    const scoredVideos = videos.map((video) => {
      const likesCount = video.likes?.length || 0;
      const commentsCount = video.comments?.length || 0;

      // Recency factor: newer videos get a small bonus (last 7 days)
      const ageInDays =
        (now - new Date(video.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const recencyBoost = ageInDays < 7 ? (7 - ageInDays) * 0.2 : 0;

      const trendingScore = likesCount + commentsCount + recencyBoost;

      return { ...video, trendingScore };
    });

    // Sort by trendingScore descending
    scoredVideos.sort((a, b) => b.trendingScore - a.trendingScore);

    // Limit results (top 10 trending videos)
    const topTrending = scoredVideos.slice(0, 10);

    res.status(200).json({
      success: true,
      count: topTrending.length,
      videos: topTrending,
    });
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getTrendingPhotos = async (req, res) => {
  try {
    const photos = await Post.find({ type: "image" })
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .lean();

    const now = Date.now();
    const scoredPhotos = photos.map((photo) => {
      const likesCount = photo.likes?.length || 0;
      const commentsCount = photo.comments?.length || 0;

      // Recency factor: newer photos get a small bonus (last 7 days)
      const ageInDays =
        (now - new Date(photo.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const recencyBoost = ageInDays < 7 ? (7 - ageInDays) * 0.2 : 0;

      const trendingScore = likesCount + commentsCount + recencyBoost;

      return { ...photo, trendingScore };
    });

    // Sort by trendingScore descending
    scoredPhotos.sort((a, b) => b.trendingScore - a.trendingScore);

    // Limit results (top 10 trending photos)
    const topTrending = scoredPhotos.slice(0, 10);

    res.status(200).json({
      success: true,
      count: topTrending.length,
      photos: topTrending,
    });
  } catch (error) {
    console.error("Error fetching trending photos:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id; // assuming JWT auth middleware sets req.user

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, msg: "Post not found" });
    }

    // check if already reported
    const alreadyReported = post.reports.some(
      (report) => report.user.toString() === userId.toString()
    );

    if (alreadyReported) {
      return res
        .status(400)
        .json({ success: false, msg: "You already reported this post" });
    }

    // push new report
    post.reports.push({ user: userId, reason });
    await post.save();

    res.status(200).json({ success: true, msg: "Post reported successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// Update post (only caption & tags)
export const updatePost = async (req, res) => {
  try {
    const { pid } = req.params; // Post ID
    const { caption, tags } = req.body;

    // Find post
    const post = await Post.findById(pid);
    if (!post) {
      return res.status(404).json({ success: false, msg: "Post not found" });
    }

    // Ensure only the owner can update
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, msg: "Not authorized to update this post" });
    }

    // Update only caption and tags
    if (caption !== undefined) post.caption = caption;
    if (tags !== undefined) post.tags = tags; // expects array of strings

    const updatedPost = await post.save();

    res.status(200).json({
      success: true,
      msg: "Post updated successfully",
      post: updatedPost,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

export const getUnseenVideoFeed = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all videos
    const videos = await Post.find({ type: "video" })
      .select("user caption tags likes comments reports videoUrl createdAt")
      .populate("user", "_id username ")
      .sort({ createdAt: -1 });

    // Separate unseen and seen videos
    const unseenVideos = [];
    const seenVideos = [];

    videos.forEach((video) => {
      const hasLiked = video.likes.some((like) => like.user.equals(userId));
      const hasCommented = video.comments.some((comment) =>
        comment.user.equals(userId)
      );
      const hasReported = video.reports.some((report) =>
        report.user.equals(userId)
      );

      if (!hasLiked && !hasCommented && !hasReported) {
        unseenVideos.push(video);
      } else {
        seenVideos.push(video);
      }
    });

    // Merge unseen first, then seen
    const orderedVideos = [...unseenVideos, ...seenVideos];

    // Map to required format
    const feed = orderedVideos.map((video) => ({
      postId: video._id,
      userId: video.user._id,
      username: video.user.username,
      caption: video.caption,
      tags: video.tags,
      videoUrl: video.videoUrl,
      totalLikes: video.likes.length,
      Comments: video.comments.length,
      createdAt: video.createdAt,
    }));

    res.status(200).json({ success: true, feed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
