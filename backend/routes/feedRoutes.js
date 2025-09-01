import express from "express";
import { getPaginatedPosts } from "../controllers/feedController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Protected feed route — ensures we know the logged-in user
router.get("/paginated", protect, getPaginatedPosts);

export default router;
