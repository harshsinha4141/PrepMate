import mongoose from "mongoose";

const interviewerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  // 🔹 Can take interviews for these roles
  expertise: [
    {
      roleType: { type: String, required: true },
      roleName: { type: String, required: true }  // e.g., "SDE", "UPSC", "NDA"
    }
  ],

  meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meeting" }],
  interviewsTaken: { type: Number, default: 0 },
  ratingSum: { type: Number, default: 0 }
}, { timestamps: true });

interviewerSchema.virtual("averageRating").get(function () {
  if (this.interviewsTaken === 0) return 0;
  return (this.ratingSum / this.interviewsTaken).toFixed(2);
});

export default mongoose.model("Interviewer", interviewerSchema);
