import express from "express";
import {
  register,
  login,
  UniqueUsername,
  verifyEmail,
  resendVerification,
  forgetpassword,
  resetpassword,
} from "../controllers/authController.js";

const router = express.Router();

// Register new user
router.post("/register", register);
// unique username
router.post("/uniqueusername", UniqueUsername);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgetpassword);
router.post("/reset-password/:token", resetpassword);
// Login existing user
router.post("/login", login);

export default router;
