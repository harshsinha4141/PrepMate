// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import intervieweeRoutes from "./routes/intervieweeRoutes.js";
import intervieweeProfileRoutes from "./routes/intervieweeProfileRoutes.js";
import interviewerRoutes from "./routes/interviewerRoutes.js";
import interviewerProfileRoutes from "./routes/interviewerProfileRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"], 
    credentials: true,
  })
);
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Free Interview Service Backend is running with JWT Auth...");
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/interviewee", intervieweeRoutes);
app.use("/api/intervieweeprofile", intervieweeProfileRoutes);
app.use("/api/interviewer", interviewerRoutes);
app.use("/api/interviewerprofile", interviewerProfileRoutes);
app.use("/api/interviewee", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/interviewee",reviewRoutes);

// Connect DB
connectDB();


export default app;
