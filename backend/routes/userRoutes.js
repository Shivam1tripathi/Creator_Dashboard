import express from "express";
import {
  getDashboard,
  getCredits,
  savePost,
  reportPost,
  completeProfile,
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboard);
router.get("/credits", protect, getCredits);
router.post("/save", protect, savePost);
router.post("/report", protect, reportPost);
router.post("/complete-profile", protect, completeProfile);

export default router;
