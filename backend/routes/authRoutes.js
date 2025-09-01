import express from "express";
import {
  register,
  login,
  UniqueUsername,
} from "../controllers/authController.js";

const router = express.Router();

// Register new user
router.post("/register", register);
// unique username
router.post("/uniqueusername", UniqueUsername);

// Login existing user
router.post("/login", login);

export default router;
