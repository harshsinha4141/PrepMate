import Meeting from "../models/Meeting.js";
import Interviewer from "../models/Interviewer.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";

export const giveReview = async (req, res) => {
  try {
    const rating = req.body.rating;
    const review = req.body.review || req.body.feedback || "";
    // accept either param name: _id or meetingId
    const { _id, meetingId } = req.params;
    const id = _id || meetingId;

    // Resolve meeting by DB _id or meetingId string
    let meeting = null;
    try {
      meeting = await Meeting.findById(id);
    } catch (e) {}
    if (!meeting) meeting = await Meeting.findOne({ meetingId: id });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (meeting.status !== "completed") return res.status(400).json({ message: "Only after completion" });

    meeting.rating = rating;
    meeting.review = review;
    await meeting.save();

    // ✅ Safely resolve interviewer
    let interviewerId = meeting.interviewerId;
    if (
      interviewerId &&
      typeof interviewerId === "object" &&
      interviewerId._id
    ) {
      interviewerId = interviewerId._id;
    }

    const interviewer = await Interviewer.findById(interviewerId).populate("userId");
    if (!interviewer) return res.status(404).json({ message: "Interviewer not found" });

    interviewer.ratingSum += rating;
    interviewer.interviewsTaken += 1;
    await interviewer.save();

    // rating updated

    const user = await User.findById(interviewer.userId._id);
    const avgRating = interviewer.ratingSum / interviewer.interviewsTaken;

    if (avgRating <= 3) {
      user.warningCount += 1;
      await sendEmail(user.email, "⚠️ Performance Warning – Please Improve", `
          <h2>Dear ${user.firstName},</h2>
          <p>Your average rating dropped to <b>${avgRating.toFixed(2)}</b>.</p>
          <p>This counts as a <b>warning (${user.warningCount}/3)</b>.</p>
        `);

      if (user.warningCount >= 3) {
        user.disabled = true;
        await sendEmail(user.email, "🚫 Account Disabled – We're Sorry to See This", `
            <h2>Dear ${user.firstName},</h2>
            <p>Your account has been disabled due to low ratings (avg < 3.0).</p>
          `);
      }
    }

    await user.save();

    res.json({ message: "Review submitted", rating, review, warnings: user.warningCount, disabled: user.disabled });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};
