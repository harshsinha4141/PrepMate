import mongoose from "mongoose";

const intervieweeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  resumeUrl: { type: String, required: true },

  // 🔹 Interested roles/exams
  interests: [
    {
      roleType: { type: String, required: true },
      roleName: { type: String, required: true } // e.g., "DevOps", "UPSC", "CDS"
    }
  ],

  meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meeting" }],
  timeSlots: [{ type: Date }]
  ,
  interviewsTaken: { type: Number, default: 0 },
  ratingSum: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Interviewee", intervieweeSchema);
