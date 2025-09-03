import Post from "../models/Post.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { v4 as uuidv4 } from "uuid";

export const createPostController = async (req, res) => {
  try {
    const { type, caption, tags } = req.fields;
    const { content } = req.files;

    // Validation
    switch (true) {
      case !type:
        return res.status(400).send({ message: "Post type is required" });
      case !content:
        return res
          .status(400)
          .send({ message: "Post content file is required" });
      case content.size > 50000000:
        return res
          .status(400)
          .send({ message: "Content must be less than 50MB" });
    }

    // Read file as binary
    const fileData = fs.readFileSync(content.path);

    // Save file directly in MongoDB
    const post = new Post({
      type,
      caption,
      tags: tags ? tags.split(",") : [],
      user: req.user._id,
      content: {
        data: fileData,
        contentType: content.type,
      },
    });

    await post.save();

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
      return res
        .status(400)
        .send({ success: false, message: "Post ID is required" });
    }

    const post = await Post.findById(id).select("content");
    if (!post || !post.content || !post.content.data) {
      return res
        .status(404)
        .send({ success: false, message: "Post content not found" });
    }

    res.set("Content-Type", post.content.contentType);
    res.send(post.content.data);
  } catch (error) {
    console.error("Error streaming post content:", error);
    return res.status(500).send({
      success: false,
      message: "Error loading content",
      error: error.message,
    });
  }
};

// Update Post
export const updatePostController = async (req, res) => {
  try {
    const { caption, tags } = req.fields;
    const { content } = req.files;

    const post = await Post.findById(req.params.pid);

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    post.caption = caption || post.caption;
    post.tags = tags ? tags.split(",") : post.tags;

    if (content) {
      post.content.data = fs.readFileSync(content.path);
      post.content.contentType = content.type;
    }

    await post.save();
    res.status(200).send({ success: true, message: "Post updated", post });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Error updating post", error });
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
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
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
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({
      success: true,
      likesCount: post.likes.length,
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

//Current user liked this post

export const isPostLiked = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

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
