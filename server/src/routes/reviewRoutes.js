import express from "express";
import { jwtAuth } from "../middlewares/auth.js";
import { giveReview } from "../controllers/reviewController.js";
import { checkUserStatus } from "../middlewares/checkUserStatus.js";

const router = express.Router();

// 📌 Submit review for a meeting
router.post("/review/:meetingId", jwtAuth, checkUserStatus, giveReview);

export default router;
