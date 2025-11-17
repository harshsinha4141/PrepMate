import cron from "node-cron";
import Meeting from "../models/Meeting.js";
import Interviewer from "../models/Interviewer.js";

/*
  Runs every minute
  - Finds meetings whose scheduled time has passed 15 min
  - Interviewer has NOT started the meeting
  - Meeting is still accepted or scheduled
*/
cron.schedule("* * * * *", async () => {
  // console.log("⏱️ Running late-meeting check...");

  try {
    const now = new Date();

    // find meetings NOT started by interviewer
    const meetings = await Meeting.find({
      interviewerStarted: { $ne: true },
      status: "accepted",
      timeSlot: { $lt: new Date(now.getTime() - 15 * 60000) }, // 15 min passed
    }).populate("interviewerId");

    for (const meeting of meetings) {
      // console.log("⚠️ Late meeting found:", meeting.meetingId);

      // 1️⃣ Add warning to interviewer
      if (meeting.interviewerId) {
        meeting.interviewerId.warnings =
          (meeting.interviewerId.warnings || 0) + 1;
        await meeting.interviewerId.save();
      }

      // 2️⃣ Reopen meeting for others
      meeting.status = "pending";
      meeting.priority = true; // Higher priority
      meeting.interviewerId = null;
      meeting.interviewerStarted = false;
      meeting.coinsReward = 100; // reward increased
      await meeting.save();

      // console.log(
      //   `🔄 Meeting ${meeting.meetingId} reset to pending with priority.`
      // );
    }
  } catch (err) {
    console.error("❌ Cron job failed:", err);
  }
});
