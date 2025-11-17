import express from "express";
import { jwtAuth } from "../middlewares/auth.js";
import { bookMeeting } from "../controllers/IntervieweeController.js";
import { checkUserStatus } from "../middlewares/checkUserStatus.js";

const router = express.Router();

// 📌 Book a meeting
router.post("/book", jwtAuth, checkUserStatus, bookMeeting);

export default router;
