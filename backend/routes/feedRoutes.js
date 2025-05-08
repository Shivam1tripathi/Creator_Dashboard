import express from "express";
import { fetchFeed } from "../controllers/feedController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Protected feed route
router.get("/", protect, fetchFeed);

export default router;
