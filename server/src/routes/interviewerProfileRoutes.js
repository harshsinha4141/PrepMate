import express from "express";
import { jwtAuth } from "../middlewares/auth.js";
import { 
  getIncomingMeetings, 
  getCompletedMeetings,
  getMeetingById
} from "../controllers/InterviewerProfileController.js";
import { checkUserStatus } from "../middlewares/checkUserStatus.js";

const router = express.Router();

// 📌 Get upcoming meetings
router.get("/upcoming", jwtAuth, checkUserStatus, getIncomingMeetings);

// 📌 Get completed meetings
router.get("/completed", jwtAuth, checkUserStatus, getCompletedMeetings);

router.get("/meeting/:id", jwtAuth, checkUserStatus, getMeetingById);
export default router;
