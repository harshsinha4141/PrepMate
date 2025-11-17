import mongoose from "mongoose";
import Meeting from "../models/Meeting.js";
import Interviewee from "../models/Interviewee.js";
import User from "../models/User.js";



// 📌 Book a meeting (Interviewee)
export const bookMeeting = async (req, res) => {
  try {
    const { roleName, roleType, timeSlot, resumeLink } = req.body;

    if (!roleName || !roleType || !timeSlot || !resumeLink) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Normalize inputs
    const normalizedRoleType = roleType.toLowerCase().trim();
    const normalizedRoleName = roleName.trim();

    // req.user is full User doc (from checkUserStatus middleware)
    const user = req.user;
    console.log("🧠 req.user from middleware:", req.user);
    console.log("🧠 req.headers.authorization:", req.headers.authorization);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.coins < 50) return res.status(400).json({ message: "Not enough coins" });

    // ✅ Find or create interviewee profile
    let interviewee = await Interviewee.findOne({ userId: user._id });
    if (!interviewee) {
      interviewee = new Interviewee({
        userId: user._id,
        resumeUrl: resumeLink,
        interests: [{ roleType: normalizedRoleType, roleName: normalizedRoleName }],
        meetings: [],
        timeSlots: []
      });
      await interviewee.save();
    }

    const meetingDate = new Date(timeSlot);
    // const istOffsetMs = 5.5 * 60 * 60 * 1000;
    // const adjustedTimeSlot = new Date(meetingDate.getTime() - istOffsetMs);

    // ✅ Prevent double booking within ±1 hour
    const clash = await Meeting.findOne({
      intervieweeId: interviewee._id,
      timeSlot: {
        $gte: new Date(meetingDate.getTime() - 60 * 60000), // 1 hour before
        $lte: new Date(meetingDate.getTime() + 60 * 60000)  // 1 hour after
      },
      status: { $in: ["pending", "accepted"] }
    });

    if (clash) {
      return res.status(400).json({ 
        message: `You already have a meeting around this time slot. Please keep at least 1 hour gap between bookings.` 
      });
    }

    // ✅ Deduct coins
    user.coins -= 50;
    await user.save();


    // ✅ Create meeting
    const meeting = new Meeting({
      meetingId: new mongoose.Types.ObjectId().toString(),
      intervieweeId: interviewee._id,
      roleName: normalizedRoleName,
      roleType: normalizedRoleType,
      timeSlot: meetingDate,
      resumeLink,
      coinsSpent: 50,
      status: "pending"
    });
    await meeting.save();

    // ✅ Update interviewee profile
    interviewee.meetings.push(meeting._id);
    interviewee.timeSlots.push(meetingDate);

    const alreadyInterested = interviewee.interests.some(
      (i) => i.roleType === normalizedRoleType && i.roleName === normalizedRoleName
    );

    if (!alreadyInterested) {
      interviewee.interests.push({ roleType: normalizedRoleType, roleName: normalizedRoleName });
    }

    console.log("Interests before saving:", JSON.stringify(interviewee.interests, null, 2));
    await interviewee.save();

    res.status(201).json({
      message: "Meeting booked successfully",
      meeting,
    });

  } catch (err) {
    console.error("❌ Error in bookMeeting:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
