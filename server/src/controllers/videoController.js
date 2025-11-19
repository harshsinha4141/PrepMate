import Meeting from "../models/Meeting.js";
import Interviewer from "../models/Interviewer.js";
import Interviewee from "../models/Interviewee.js";
import User from "../models/User.js";
import Chat from "../models/chat.js";
export const startInterview = async (req, res) => {
  const { _id, meetingId } = req.params;
  const userId = req.user.userId;

  try {
    const id = _id || meetingId;
    const meeting = await Meeting.findOne({ $or: [{ _id: id }, { meetingId: id }] });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // Check if meeting time has arrived (stored as IST in UTC)
    const now = new Date();
    const meetingTime = new Date(meeting.timeSlot);
    
    if (now < meetingTime) {
      return res.status(400).json({ 
        message: "Meeting can only be started at or after the scheduled time" 
      });
    }

    if (!meeting.startedUsers) meeting.startedUsers = [];
    if (!meeting.startedUsers.includes(userId)) {
      meeting.startedUsers.push(userId);
      await meeting.save();
    }

    const roomUrl = `${process.env.SERVER_URL}/video/${meeting.meetingId}`;
    meeting.interviewerStarted = true;
    await meeting.save();
    res.json({ message: "Interview started", roomUrl });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};
// 📌 End the interview
export const endInterview = async (req, res) => {
  try {
    const { _id, meetingId } = req.params;
    const userId = req.user.userId;

    // Resolve meeting by DB _id or legacy meetingId string
    const id = _id || meetingId;
    const meeting = await Meeting.findOne({ $or: [{ _id: id }, { meetingId: id }] });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (meeting.status === "completed") return res.status(400).json({ message: "Already completed" });

    // mark meeting completed and record end info
    meeting.status = "completed";
    meeting.endedBy = userId;
    meeting.endedAt = new Date();

    // Award coins to interviewer (reuse the same reward rules)
    const reward = meeting.priority ? 100 : 50;
    try {
      const interviewer = await Interviewer.findById(meeting.interviewerId).populate("userId");
      if (interviewer && interviewer.userId) {
        const user = await User.findById(interviewer.userId._id);
        if (user) {
          user.coins = (user.coins || 0) + reward;
          // increment interviewsGiven for the user (they gave this interview)
          user.interviewsGiven = (user.interviewsGiven || 0) + 1;
          await user.save();
        }
        // increment interviewer's interviewsTaken counter as well
        try {
          interviewer.interviewsTaken = (interviewer.interviewsTaken || 0) + 1;
          await interviewer.save();
        } catch (e) {}
      }
    } catch (e) {
      // non-fatal
    }

    // Also increment interviewee counters (they gave this interview)
    try {
      if (meeting.intervieweeId) {
        const interviewee = await Interviewee.findById(meeting.intervieweeId).populate("userId");
        if (interviewee) {
          interviewee.interviewsGiven = (interviewee.interviewsGiven || 0) + 1;
          await interviewee.save();

          // increment the User.interviewsGiven for the interviewee as well
          if (interviewee.userId) {
            const intervieweeUser = await User.findById(interviewee.userId._id || interviewee.userId);
            if (intervieweeUser) {
              intervieweeUser.interviewsGiven = (intervieweeUser.interviewsGiven || 0) + 1;
              await intervieweeUser.save();
            }
          }
        }
      }
    } catch (e) {
      // non-fatal
    }

    // Remove chat for this meeting
    try {
      await Chat.findOneAndDelete({ meetingId: meeting._id });
    } catch (e) {}

    await meeting.save();

    // Notify clients in both possible room ids and attempt to disconnect sockets
    try {
      const io = req.app.get("io");
      const roomA = meeting.meetingId;
      const roomB = meeting._id && meeting._id.toString();
      if (io) {
        if (roomA) io.to(roomA).emit("meetingEnded", { meetingId: roomA });
        if (roomB) io.to(roomB).emit("meetingEnded", { meetingId: roomB });

        // attempt to disconnect sockets in those rooms (best-effort)
        try {
          if (roomA && io.in) io.in(roomA).disconnectSockets && io.in(roomA).disconnectSockets(true);
          if (roomB && io.in) io.in(roomB).disconnectSockets && io.in(roomB).disconnectSockets(true);
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {}

    return res.json({ message: "Interview completed", reward });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

