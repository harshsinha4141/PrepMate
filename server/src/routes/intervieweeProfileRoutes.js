import express from "express";
import { jwtAuth } from "../middlewares/auth.js";
import { 
  getIncomingMeetings, 
  getCompletedMeetings
} from "../controllers/intervieweeProfileController.js";
import { checkUserStatus } from "../middlewares/checkUserStatus.js";

const router = express.Router();
// 📌 Get upcoming meetings
router.get("/upcoming", jwtAuth, checkUserStatus, getIncomingMeetings);

// 📌 Get completed meetings
router.get("/completed", jwtAuth, checkUserStatus, getCompletedMeetings);

export default router;

