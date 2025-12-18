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

dotenv.config({ debug: true });

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  "https://prep-mate-gold.vercel.app",
  "https://prepmate-1-82bj.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
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

// Connect DB
connectDB();


export default app;
