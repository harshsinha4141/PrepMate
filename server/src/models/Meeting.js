import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  meetingId: { type: String, unique: true },
  intervieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interviewee",
    required: true,
  },
  interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "Interviewer" },

  roleType: { type: String, required: true, trim: true },
  roleName: { type: String, required: true, trim: true },

  timeSlot: { type: Date, required: true },
  resumeLink: { type: String, required: true },

  status: {
    type: String,
    enum: ["pending", "accepted", "completed", "cancelled"],
    default: "pending",
  },

  priority: { type: Boolean, default: false },
  coinsSpent: { type: Number, default: 50 },
  coinsReward: { type: Number, default: 50 },

  createdAt: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },

  // 🆕 ADD THESE:
  startedUsers: { type: [String], default: [] },
  interviewerStarted: { type: Boolean, default: false },
});

export default mongoose.model("Meeting", meetingSchema);
