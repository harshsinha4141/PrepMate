import express from "express";
import { jwtAuth } from "../middlewares/auth.js";
import { 
  startChat, 
  sendMessage, 
  getChatMessages 
} from "../controllers/chatController.js";
import { checkUserStatus } from "../middlewares/checkUserStatus.js";
const router = express.Router();

// Initialize chat session
router.post("/start/:meetingId", jwtAuth, checkUserStatus, startChat);

// Send a chat message
router.post("/message/:meetingId", jwtAuth, checkUserStatus, sendMessage);

// Get all messages for a meeting
router.get("/messages/:meetingId", jwtAuth, checkUserStatus, getChatMessages);

export default router;
