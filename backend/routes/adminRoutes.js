import express from "express";
import {
  getAllUsers,
  updateUserCredits,
  getAnalytics,
} from "../controllers/adminController.js";
import { allowRoles, protect } from "../middlewares/auth.js";

const router = express.Router();

// All routes are protected and admin-only
router.use(protect, allowRoles("admin"));

router.get("/users", getAllUsers);
router.put("/credits", updateUserCredits);
router.get("/analytics", getAnalytics);

export default router;
