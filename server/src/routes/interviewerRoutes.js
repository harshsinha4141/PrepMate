import express from "express";
import { jwtAuth } from "../middlewares/auth.js";
import { 
  getPendingMeetings, 
  acceptMeeting, 
  completeMeeting, 

  markInterviewerStarted
  , markUserJoined,
  handleNoShow
} from "../controllers/interviewerController.js";
import { checkUserStatus } from "../middlewares/checkUserStatus.js";


const router = express.Router();

// 📌 Get all pending meetings with filters
router.get("/pending", jwtAuth, checkUserStatus, getPendingMeetings);

// 📌 Accept a meeting
router.post("/accept/:meetingId", jwtAuth, checkUserStatus, acceptMeeting);

// 📌 Complete a meeting
router.post("/complete/:meetingId", jwtAuth, checkUserStatus, completeMeeting);
router.post("/noshow/:meetingId", jwtAuth, checkUserStatus, handleNoShow);
router.post(
  "/meeting-started/:meetingId",
  jwtAuth,
  checkUserStatus,
  markInterviewerStarted
);
router.post("/meeting/:id/user-joined", jwtAuth, markUserJoined);
router.post("/reschedule/:meetingId", jwtAuth, checkUserStatus, handleNoShow);

export default router;
