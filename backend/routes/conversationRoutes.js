import express from "express";
import { getConversations } from "../controllers/conversationController.js";

const router = express.Router();

router.get("/:userId", getConversations);

export default router;
