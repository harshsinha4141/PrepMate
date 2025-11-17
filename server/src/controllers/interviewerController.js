import Meeting from "../models/Meeting.js";
import Interviewer from "../models/Interviewer.js";
import Interviewee from "../models/Interviewee.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import Chat from "../models/chat.js";
import { io } from "../server.js";

// 📌 Get pending meetings with filters
export const getPendingMeetings = async (req, res) => {
  try {
    let interviewer = await Interviewer.findOne({ userId: req.user._id });

    // If interviewer profile doesn't exist, create it
    if (!interviewer) {
      interviewer = new Interviewer({
        userId: req.user._id,
        skills: [],
        meetings: [],
        interviewsTaken: 0,
        ratingSum: 0,
      });
      await interviewer.save();
    }

    let query = { status: "pending" };

    // Exclude meetings where this user is the interviewee
    const intervieweeProfile = await Interviewee.findOne({
      userId: req.user._id,
    });
    if (intervieweeProfile) {
      query.intervieweeId = { $ne: intervieweeProfile._id };
    }

    // Filters
    const {
      roleType,
      roleName,
      startTime,
      endTime,
      page = 1,
      limit = 10,
    } = req.query;

    if (roleType) query.roleType = { $regex: roleType, $options: "i" };
    if (roleName) query.roleName = { $regex: roleName, $options: "i" };

    if (startTime && endTime) {
      query.timeSlot = { $gte: new Date(startTime), $lte: new Date(endTime) };
    } else if (startTime) {
      query.timeSlot = { $gte: new Date(startTime) };
    } else if (endTime) {
      query.timeSlot = { $lte: new Date(endTime) };
    }

    // Pagination numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch paginated meetings
    const [meetings, totalCount] = await Promise.all([
      Meeting.find(query)
        .sort({ priority: -1, timeSlot: 1 }) // high priority first
        .skip(skip)
        .limit(limitNum)
        .populate("intervieweeId", "userId resumeUrl rolesInterested"),

      Meeting.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      page: pageNum,
      totalPages,
      count: totalCount,
      pageCount: meetings.length,
      meetings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};



// 📌 Accept meeting
export const acceptMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId })
      .populate("intervieweeId")
      .populate("interviewerId");

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    let interviewer = await Interviewer.findOne({ userId: req.user._id });
    if (!interviewer) {
      interviewer = new Interviewer({
        userId: req.user._id,
        meetings: [],
        ratingSum: 0,
        interviewsTaken: 0,
        expertise: []
      });
      await interviewer.save();
    }

    meeting.interviewerId = interviewer._id;
    meeting.status = "accepted";

    if (meeting.priority) {
      const now = new Date();
      meeting.timeSlot = new Date(now.getTime() + 15 * 60000); // 15 min from now
    }

    await meeting.save();
    interviewer.meetings.push(meeting._id);
    await interviewer.save();

    // 📧 Send emails
    const userInterviewer = await User.findById(interviewer.userId);
    const userInterviewee = await User.findById(meeting.intervieweeId.userId);

    await sendEmail(
      userInterviewee.email,
      "✅ Your Interview Has Been Accepted!",
      `
        <h2>Hi ${userInterviewee.firstName},</h2>
        <p>Your interview request (<b>ID: ${meeting.meetingId}</b>) has been <b>accepted</b>.</p>
        <p>👤 <b>Interviewer:</b> ${userInterviewer.firstName} ${userInterviewer.lastName}</p>
        <p>⭐ <b>Current Rating:</b> ${
          userInterviewer.interviewsTaken > 0
            ? (userInterviewer.ratingSum / userInterviewer.interviewsTaken).toFixed(2)
            : "No ratings yet"
        }</p>
        <p>🗓️ Scheduled Time: ${meeting.timeSlot}</p>
        <br/>
        <p>💡 <i>Best of luck for your upcoming interview! Give your best effort and showcase your skills.</i></p>
        <br/>
        <p>— The PrepMate Team</p>
      `
    );

    await sendEmail(
      userInterviewer.email,
      "📌 New Interview Scheduled",
      `
        <h2>Hi ${userInterviewer.firstName},</h2>
        <p>You have <b>accepted</b> a new interview (<b>Meeting ID: ${meeting.meetingId}</b>).</p>
        <p>👤 <b>Interviewee:</b> ${userInterviewee.firstName} ${userInterviewee.lastName}</p>
        <p>📚 <b>Role:</b> ${meeting.roleType} - ${meeting.roleName}</p>
        <p>📄 <b>Resume:</b> <a href="${meeting.resumeLink}" target="_blank">View Resume</a></p>
        <p>🗓️ Scheduled Time: ${meeting.timeSlot}</p>
        <br/>
        <p>💡 <i>Prepare well for this session and provide constructive feedback to help the candidate grow. 
        Remember, great guidance earns you higher ratings!</i></p>
        <br/>
        <p>— The PrepMate Team</p>
      `
    );

const meetingTime = new Date(meeting.timeSlot); // ensure it's a Date
const reminderTime = new Date(meetingTime.getTime() - 10 * 60000);
const now = new Date();
const delay = reminderTime - now;

console.log("Reminder delay in ms:", delay);

if (delay > 0) {
  setTimeout(async () => {
    try {
      const reminderSubject = "⏰ Interview Reminder: Starts in 10 minutes";
      
      const intervieweeBody = `
        <h2>Hi ${userInterviewee.firstName},</h2>
        <p>This is a reminder that your interview (<b>ID: ${meeting.meetingId}</b>) has been scheduled to start in <b>10 minutes</b>.</p>
        <p>👤 <b>Interviewer:</b> ${userInterviewer.firstName} ${userInterviewer.lastName}</p>
        <p>⭐ <b>Current Rating of Interviewer:</b> ${
          userInterviewer.interviewsTaken > 0
            ? (userInterviewer.ratingSum / userInterviewer.interviewsTaken).toFixed(2)
            : "No ratings yet"
        }</p>
        <p>🗓️ <b>Scheduled Time:</b> ${meeting.timeSlot}</p>
        <p>📚 <b>Role:</b> ${meeting.roleType} - ${meeting.roleName}</p>
        <p>📄 <b>Resume Link:</b> <a href="${meeting.resumeLink}" target="_blank">View Resume</a></p>
        <br/>
        <p>💡 <i>Be prepared, stay calm, and give your best effort!</i></p>
        <br/>
        <p>— The PrepMate Team</p>
      `;

      const interviewerBody = `
        <h2>Hi ${userInterviewer.firstName},</h2>
        <p>This is a reminder that your interview with <b>${userInterviewee.firstName} ${userInterviewee.lastName}</b> (<b>Meeting ID: ${meeting.meetingId}</b>) will start in <b>10 minutes</b>.</p>
        <p>🗓️ <b>Scheduled Time:</b> ${meeting.timeSlot}</p>
        <p>📚 <b>Role:</b> ${meeting.roleType} - ${meeting.roleName}</p>
        <p>📄 <b>Candidate Resume:</b> <a href="${meeting.resumeLink}" target="_blank">View Resume</a></p>
        <br/>
        <p>💡 <i>Prepare well, provide constructive feedback, and make the candidate feel confident!</i></p>
        <br/>
        <p>— The PrepMate Team</p>
      `;

      await sendEmail(userInterviewee.email, reminderSubject, intervieweeBody);
      await sendEmail(userInterviewer.email, reminderSubject, interviewerBody);

      console.log("Reminder emails sent!");
    } catch (err) {
      console.error("Failed to send reminder emails:", err);
    }
  }, delay);
} else {
  console.log("Reminder time already passed or less than 10 minutes away.");
}

    res.json({ message: "Meeting accepted", meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// 📌 Complete meeting
export const completeMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if (meeting.status === "completed") return res.status(400).json({ message: "Already completed" });

    meeting.status = "completed";
    await meeting.save();

    const interviewer = await Interviewer.findById(meeting.interviewerId).populate("userId");
    const reward = meeting.priority ? 100 : 50;

    const user = await User.findById(interviewer.userId._id);
    user.coins += reward;
    // increment interviewsGiven for the interviewer user
    user.interviewsGiven = (user.interviewsGiven || 0) + 1;
    await user.save();

    // also increment interviewer profile count
    try {
      interviewer.interviewsTaken = (interviewer.interviewsTaken || 0) + 1;
      await interviewer.save();
    } catch (e) {}

    // Also increment interviewee counters (they took this interview)
    try {
      if (meeting.intervieweeId) {
        const interviewee = await Interviewee.findById(meeting.intervieweeId).populate("userId");
        if (interviewee) {
          interviewee.interviewsTaken = (interviewee.interviewsTaken || 0) + 1;
          await interviewee.save();

          if (interviewee.userId) {
            const intervieweeUser = await User.findById(interviewee.userId._id || interviewee.userId);
            if (intervieweeUser) {
              intervieweeUser.interviewsTaken = (intervieweeUser.interviewsTaken || 0) + 1;
              await intervieweeUser.save();
            }
          }
        }
      }
    } catch (e) {
      // non-fatal
    }

    // Mark chat as inactive or delete it
    await Chat.findOneAndDelete({ meetingId: meeting._id });

    // Emit meetingEnded to both possible room ids so clients redirect
    try {
      const roomA = meeting.meetingId;
      const roomB = meeting._id && meeting._id.toString();
      if (roomA) io.to(roomA).emit("meetingEnded", { meetingId: roomA, message: "The interviewer has ended the meeting." });
      if (roomB) io.to(roomB).emit("meetingEnded", { meetingId: roomB, message: "The interviewer has ended the meeting." });
    } catch (e) {
      // best-effort
    }

    res.json({ message: "Meeting completed", reward, coins: user.coins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const handleNoShow = async (req, res) => {
  const { meetingId } = req.params;

  const meeting = await Meeting.findOne({ meetingId })
    .populate("interviewerId")
    .populate("intervieweeId");

  if (!meeting) return res.status(404).json({ message: "Meeting not found" });

  const scheduledTime = new Date(meeting.timeSlot).getTime();
  const now = Date.now();
  const diffMin = (now - scheduledTime) / (1000 * 60);

  // interviewer did NOT start meeting within 15 min
  if (!meeting.interviewerStarted && diffMin >= 15) {
    const interviewer = meeting.interviewerId;

    // Increase penalty
    interviewer.warningCount += 1;
    interviewer.rating = Math.max(1, interviewer.rating - 1);
    await interviewer.save();

    // Mark meeting as high priority
    meeting.priority = true;
    meeting.status = "awaiting_reschedule"; // NEW state
    await meeting.save();

    return res.json({
      success: true,
      needsReschedule: true,
      message: "Interviewer no-show. Penalty applied.",
    });
  }

  res.json({ success: false, message: "Not a no-show scenario." });
};
export const markInterviewerStarted = async (req, res) => {
  try {
    const { meetingId } = req.params;

    // Resolve meeting param (accept either DB _id or meetingId string)
    let meeting = null;
    try {
      meeting = await Meeting.findById(meetingId);
    } catch (e) {
      // ignore invalid ObjectId
    }
    if (!meeting) {
      meeting = await Meeting.findOne({ meetingId });
    }
    if (!meeting) return res.status(404).json({ message: "Not found" });

    meeting.interviewerStarted = true;
    if (!Array.isArray(meeting.startedUsers)) meeting.startedUsers = [];
    if (!meeting.startedUsers.includes(req.user.userId)) {
      meeting.startedUsers.push(req.user.userId);
    }
    await meeting.save();

    // Emit via io from the express app to notify room members on both possible room ids
    const io = req.app.get("io");
    if (io) {
      const roomA = meeting.meetingId;
      const roomB = meeting._id && meeting._id.toString();
      if (roomA) io.to(roomA).emit("interviewerStartedUpdate", { meetingId: roomA });
      if (roomB) io.to(roomB).emit("interviewerStartedUpdate", { meetingId: roomB });
      console.log(`📢 Emitted interviewerStartedUpdate for ${roomA} and ${roomB}`);
    }

    res.json({ message: "Interviewer started meeting", success: true });
  } catch (err) {
    console.error("markInterviewerStarted error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const markUserJoined = async (req, res) => {
  try {
    const meetingParam = req.params.id;
    const userId = req.user.userId;

    // Resolve meeting by DB _id or meetingId string
    let meeting = null;
    try {
      meeting = await Meeting.findById(meetingParam);
    } catch (e) {
      // ignore
    }
    if (!meeting) {
      meeting = await Meeting.findOne({ meetingId: meetingParam });
    }
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // Add user only once
    if (!Array.isArray(meeting.startedUsers)) meeting.startedUsers = [];
    if (!meeting.startedUsers.includes(userId)) {
      meeting.startedUsers.push(userId);
      await meeting.save();
    }

    return res.json({ success: true, message: "User join recorded" });
  } catch (err) {
    console.error("❌ markUserJoined error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const rescheduleMeeting = async (req, res) => {
  const { meetingId } = req.params;
  const { timeSlot } = req.body;

  const meeting = await Meeting.findOne({ meetingId });
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });

  meeting.timeSlot = timeSlot;
  meeting.status = "pending";
  meeting.priority = true; // High priority now
  await meeting.save();

  res.json({ success: true, message: "Meeting rescheduled" });
};

