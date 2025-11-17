// src/routes/interviewRoutes.js
import express from "express";
import { startInterview,endInterview } from "../controllers/videoController.js"; // or wherever your controller is
import { jwtAuth } from "../middlewares/auth.js";
import { checkUserStatus } from "../middlewares/checkUserStatus.js";
const router = express.Router();

// Route to start the interview (protected)
router.post("/interview/:meetingId/start", jwtAuth, checkUserStatus, startInterview);
router.post("/interview/complete/:meetingId",jwtAuth,checkUserStatus,endInterview);

export default router;
