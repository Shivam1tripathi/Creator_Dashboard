import express from "express";
import { getMessages, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

//create message
router.post("/", sendMessage);
//get message
router.get("/:conversationId", getMessages);

export default router;
