import express from "express";
import formidableMiddleware from "express-formidable";

import {
  createPostController,
  updatePostController,
  deletePostController,
  getAllPostsByUserController,
  getPostContentController,
  getUserbypostid,
  getSinglePostController,
  addPostComment,
  getPostComments,
  togglePostLike,
  getPostLikesCount,
  isPostLiked,
  postSearchController,
  getTrendingVideos,
  getTrendingPhotos,
} from "../controllers/postController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Routes
//create post
router.post(
  "/create-post",
  protect,
  formidableMiddleware(),
  createPostController
);
//get all post by user id
router.get("/get-allpost/:uid", getAllPostsByUserController);
//get single post by post id
router.get("/get-singlepost/:pid", getSinglePostController);
//get user by post id
router.get("/get-user/:pid", getUserbypostid);
//get post url by post id
router.get("/post-content/:pid", getPostContentController);
//get post comments by post id
router.get("/post-comments/:pid", getPostComments);
//Adding like
router.post("/like/:pid", protect, togglePostLike);
//get post total like
router.get("/likes/:pid", getPostLikesCount);
//Current user liked this post
router.post("/is-liked", protect, isPostLiked);
//add comment in post by post id
router.post("/addpostcomment/:pid", protect, addPostComment);
router.put(
  "/update-post/:pid",
  protect,
  formidableMiddleware(),
  updatePostController
);
router.delete("/delete-post/:pid", protect, deletePostController);
router.get("/trending-videos", getTrendingVideos);
router.get("/trending-photos", getTrendingPhotos);
router.get("/search-posts", postSearchController);
export default router;
