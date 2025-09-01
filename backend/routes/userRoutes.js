import express from "express";
import formidableMiddleware from "express-formidable";

import {
  getDashboard,
  getCredits,
  savePost,
  reportPost,
  completeProfile,
  getSingleUser,
  getUserProfilePictureController,
  isPostSaved,
  userSearchController,
  isFollowingController,
  followUserController,
  getSuggestedUsers,
  getTopUsers,
  getSavedPosts,
  updateProfile,
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboard);
router.get("/single-user/:id", protect, getSingleUser);
router.get("/profile-picture/:uid", getUserProfilePictureController);
router.get("/credits", protect, getCredits);
router.get("/is-saved/:pid", protect, isPostSaved);
router.post("/save-post", protect, savePost);
router.post("/report", protect, reportPost);
router.post("/complete-profile", protect, completeProfile);
router.get("/search-users", userSearchController);
router.get("/is-following/:currentuser/:checkinguser", isFollowingController);
router.get("/top-followed", protect, getTopUsers);
router.get("/suggested-users", protect, getSuggestedUsers);
router.post("/follow/:targetId", protect, followUserController);
router.get("/saved", protect, getSavedPosts);
router.patch("/update-profile", protect, updateProfile);
export default router;
