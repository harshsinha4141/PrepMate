import User from "../models/User.js";
import Interviewer from "../models/Interviewer.js";
import Meeting from "../models/Meeting.js";

// 📌 Get interviewer upcoming (incoming) meetings
export const getIncomingMeetings = async (req, res) => {
  try {
    const interviewer = await Interviewer.findOne({ userId: req.user._id }); if (!interviewer) return res.status(404).json({ message: "Interviewer profile not found" });
    // Find meetings where this Interviewer is the interviewer
    const meetings = await Meeting.find({
      interviewerId: interviewer._id,
      status: "accepted",
    }).populate({
        path: "intervieweeId",
        populate: { path: "userId", select: "firstName lastName email" },
      })
        .sort({ timeSlot: 1 });

    res.json({
      count: meetings.length,
      meetings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const getMeetingById = async (req, res) => {
  try {
   
    let meeting = await Meeting.findById( req.params.id) // ✅ changed line
      .populate({
        path: "intervieweeId",
        populate: { path: "userId", select: "firstName lastName email _id" },
      })
      .populate({
        path: "interviewerId",
        populate: { path: "userId", select: "firstName lastName email _id" },
      });
      if (!meeting) {
        meeting = await Meeting.findOne({ meetingId: req.params.id })
          .populate({
            path: "intervieweeId",
            populate: {
              path: "userId",
              select: "firstName lastName email _id",
            },
          })
          .populate({
            path: "interviewerId",
            populate: {
              path: "userId",
              select: "firstName lastName email _id",
            },
          });
      }
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.status(200).json({ meeting });
  } catch (err) {
    console.error("❌ Error in getMeetingById:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// 📌 Get interviewer completed meetings
export const getCompletedMeetings = async (req, res) => {
  try {
    const interviewer = await Interviewer.findOne({ userId: req.user._id }); if (!interviewer) return res.status(404).json({ message: "Interviewer profile not found" });

    // Find meetings where this Interviewer is the interviewer
    const meetings = await Meeting.find({
      interviewerId: interviewer._id,
      status: "completed",
    })
      .populate({
        path: "intervieweeId",
        populate: { path: "userId", select: "firstName lastName email" },
      })
        .sort({ timeSlot: -1 });

    res.json({
      count: meetings.length,
      meetings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
