import Interviewee from "../models/Interviewee.js";
import Meeting from "../models/Meeting.js";

// 📌 Get interviewee upcoming (incoming) meetings
export const getIncomingMeetings = async (req, res) => {
  try {
    const interviewee = await Interviewee.findOne({ userId: req.user._id });
    if (!interviewee) return res.status(404).json({ message: "Interviewee profile not found" });

    const meetings = await Meeting.find({
      intervieweeId: interviewee._id,
      status: { $in: ["accepted"] },
    })
      .populate({
        path: "interviewerId",
        populate: { path: "userId", select: "firstName lastName email" },
      })
      .sort({ timeSlot: 1 });


    res.json({
      count: meetings.length,
      meetings
    });
    console.log("meetings:-",meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// 📌 Get interviewee completed meetings
export const getCompletedMeetings = async (req, res) => {
  try {
    const interviewee = await Interviewee.findOne({ userId: req.user._id });
    if (!interviewee) return res.status(404).json({ message: "Interviewee profile not found" });

    const meetings = await Meeting.find({
      intervieweeId: interviewee._id,
      status: "completed"
    })
      .populate({
        path: "interviewerId",
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



