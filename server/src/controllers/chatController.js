import Chat from "../models/chat.js";

// Start chat (if not exists)
export const startChat = async (req, res) => {
  const { meetingId } = req.params;
  const userId = req.user?._id;

  try {
    console.log("📩 Starting chat for meeting (raw param):", meetingId);
    const Meeting = await import("../models/Meeting.js").then((m) => m.default);

    // Try find by ObjectId first, then fallback to meetingId string field
    let meeting = null;
    try {
      meeting = await Meeting.findById(meetingId);
    } catch (e) {
      // ignore invalid ObjectId cast errors
    }
    if (!meeting) {
      meeting = await Meeting.findOne({ meetingId: meetingId });
    }

    if (!meeting) {
      console.warn("⚠️ startChat: Meeting not found for param:", meetingId);
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const resolvedMeetingId = meeting._id;

    // Ensure we look up chats using the DB ObjectId
    let chat = await Chat.findOne({ meetingId: resolvedMeetingId });

    if (!chat) {
      chat = new Chat({
        meetingId: resolvedMeetingId,
        messages: [],
        totalWords: 0,
        isActive: true,
      });
      await chat.save();
      console.log("✅ New chat created:", chat._id, "for meeting", resolvedMeetingId);
    } else {
      console.log("✅ Chat already exists:", chat._id, "for meeting", resolvedMeetingId);
    }

    res.status(200).json({
      success: true,
      message: "Chat session ready",
      chat,
    });
  } catch (err) {
    console.error("❌ Error starting chat:", err);
    res.status(500).json({
      success: false,
      message: "Failed to initialize chat",
      error: err.message,
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  const { meetingId } = req.params;
  const { sender, content } = req.body;

  try {
    const wordCount = content.trim().split(/\s+/).length;

    const chat = await Chat.findOne({ meetingId, isActive: true });
    if (!chat) {
      return res.status(400).json({
        success: false,
        message: "Chat is not active or does not exist.",
      });
    }

    if (chat.totalWords + wordCount > 500) {
      return res.status(403).json({
        success: false,
        message: "Word limit exceeded. Cannot send more messages.",
      });
    }

    chat.messages.push({ sender, content, timestamp: new Date() });
    chat.totalWords += wordCount;
    await chat.save();

    res.json({
      success: true,
      message: "Message sent",
      chat,
    });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: err.message,
    });
  }
};

// Get chat messages - resolve meeting param to canonical meeting._id before lookup
export const getChatMessages = async (req, res) => {
  const { meetingId } = req.params;

  try {
    console.log("📡 Fetching messages for meeting:", meetingId); // Debug log

    // Resolve the incoming meetingId param to the canonical Meeting._id
    let chat = null;
    try {
      const Meeting = await import("../models/Meeting.js").then((m) => m.default);

      // Try find as DB _id first
      let meeting = null;
      try {
        meeting = await Meeting.findById(meetingId);
      } catch (e) {
        // ignore invalid ObjectId cast
      }

      // If not found, try lookup by meetingId string field
      if (!meeting) {
        meeting = await Meeting.findOne({ meetingId: meetingId });
      }

      if (meeting) {
        console.log("🔎 Resolved meeting param to meeting._id:", meeting._id);
        chat = await Chat.findOne({ meetingId: meeting._id }).populate([
          { path: "meetingId", populate: ["interviewerId", "intervieweeId"] },
        ]);
      }
    } catch (err) {
      console.error("❌ Error resolving meeting in getChatMessages:", err);
    }

    // Fallback: try legacy lookup by raw meetingId (in case chat was created with a string id)
    if (!chat) {
      chat = await Chat.findOne({ meetingId }).populate([
        { path: "meetingId", populate: ["interviewerId", "intervieweeId"] },
      ]);
    }

    if (!chat) {
      console.log("❌ Chat not found for meeting:", meetingId);
      return res.status(404).json({
        success: false,
        message: "Chat session not found.",
      });
    }

    console.log("✅ Chat found with", chat.messages.length, "messages");

    // Return the complete chat object (not just messages and isActive)
    res.status(200).json({
      success: true,
      _id: chat._id,
      meetingId: chat.meetingId,
      messages: chat.messages || [],
      isActive: chat.isActive,
      totalWords: chat.totalWords || 0,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    });
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: err.message,
    });
  }
};
