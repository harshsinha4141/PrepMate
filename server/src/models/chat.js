import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", required: true, unique: true },
  messages: [
    {
      sender: { type: String, enum: ["interviewer", "interviewee"], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  totalWords: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true } // Chat closes when interview completes
});

export default mongoose.model("Chat", chatSchema);
