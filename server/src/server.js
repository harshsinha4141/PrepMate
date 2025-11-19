// src/server.js
import http from "http";
import { Server } from "socket.io";
import app from "./index.js";
import Chat from "./models/chat.js";
import jwt from "jsonwebtoken";
import "./cron/checkLateInterviewers.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

app.set("io", io);

// -------------------------------------------------------
//  SOCKET AUTH MIDDLEWARE
// -------------------------------------------------------
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token)
      return next(new Error("Authentication error: No token provided"));

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    socket.userId = decoded.userId;
    socket.email = decoded.email;

    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid/Expired token"));
  }
});

// -------------------------------------------------------
//  SOCKET EVENTS
// -------------------------------------------------------
io.on("connection", (socket) => {
  // console.log(`⚡ User connected: ${socket.userId}, Socket: ${socket.id}`);

  // ---------------------------------------------------
  // JOIN VIDEO ROOM
  // ---------------------------------------------------
  socket.on("joinVideoRoom", (meetingId) => {
    if (!meetingId) return;
    socket.join(meetingId);
    // console.log(`🎥 User ${socket.userId} joined meeting: ${meetingId}`);
  });

  // ---------------------------------------------------
  // INTERVIEWER STARTED MEETING
  // ---------------------------------------------------
  socket.on("interviewerStarted", ({ meetingId }) => {
    // console.log(`🟢 interviewerStarted received for ${meetingId}`);

    // Broadcast only inside room
    // io.to(meetingId).emit("interviewerStartedUpdate", { meetingId });
  });

  // ---------------------------------------------------
  // MEETING ENDED
  // (server broadcasts to both interviewer & interviewee)
  // ---------------------------------------------------
  socket.on("meetingEnded", ({ meetingId }) => {
    // console.log(`🔴 Meeting ended manually for ${meetingId}`);

    // io.to(meetingId).emit("meetingEnded", { meetingId });
  });

  // ---------------------------------------------------
  // LIVE CODE EDITOR – REALTIME SYNC
  // ---------------------------------------------------
  socket.on("codeUpdate", ({ meetingId, code }) => {
    if (!meetingId) return;
    // socket.to(meetingId).emit("codeUpdate", { meetingId, code });
  });

  // ---------------------------------------------------
  // JOIN CHAT ROOM
  // ---------------------------------------------------
  socket.on("joinChat", (meetingId) => {
    if (!meetingId) return;
    socket.join(meetingId);
    // console.log(`💬 User ${socket.userId} joined chat room ${meetingId}`);
  });

  // ---------------------------------------------------
  // HANDLE SENDING CHAT MESSAGE
  // ---------------------------------------------------
  socket.on("sendMessage", async (msgData) => {
    try {
      const { meetingId, sender, content } = msgData;

      if (!socket.userId) {
        socket.emit("errorMessage", "Authentication required");
        return;
      }

      

      // Resolve the meeting param first (msgData.meetingId may be either Meeting._id or a meetingId string)
      let chat = null;
      try {
        const Meeting = await import("./models/Meeting.js").then((m) => m.default);
        let meetingRecord = null;
        try {
          meetingRecord = await Meeting.findById(meetingId).populate([
            { path: "interviewerId", populate: "userId" },
            { path: "intervieweeId", populate: "userId" },
          ]);
        } catch (e) {
          // invalid ObjectId cast - ignore
        }
        if (!meetingRecord) {
          meetingRecord = await Meeting.findOne({ meetingId: meetingId }).populate([
            { path: "interviewerId", populate: "userId" },
            { path: "intervieweeId", populate: "userId" },
          ]);
        }

        if (meetingRecord) {
          // Find chat by the canonical Meeting._id reference
          chat = await Chat.findOne({ meetingId: meetingRecord._id }).populate([
            { path: "meetingId", populate: ["interviewerId", "intervieweeId"] },
          ]);
        }
      } catch (err) {
        
      }

      // Fallback: if no meeting record or no chat linked to meeting._id, try legacy lookup by the raw meetingId
      if (!chat) {
        chat = await Chat.findOne({ meetingId }).populate([
          { path: "meetingId", populate: ["interviewerId", "intervieweeId"] },
        ]);
      }

      if (!chat) return socket.emit("errorMessage", "Chat not found");

      // Validate user is part of this meeting
      
      const interviewerUid =
        chat.meetingId?.interviewerId?.userId?._id?.toString();
      const intervieweeUid =
        chat.meetingId?.intervieweeId?.userId?._id?.toString();

      

      const isParticipant =
        interviewerUid === socket.userId || intervieweeUid === socket.userId;

      if (!isParticipant) {
        return socket.emit("errorMessage", "Not authorized for this chat");
      }

      // Resolve room id(s) to broadcast to — clients may have joined using the raw meetingId
      const resolvedRoomId =
        (chat?.meetingId?._id && chat.meetingId._id.toString()) ||
        (chat?.meetingId && chat.meetingId.toString()) ||
        (meetingRecord?._id && meetingRecord._id.toString()) ||
        meetingId;

      const roomTargets = new Set([meetingId, resolvedRoomId]);

      // Check chat lock
      if (!chat.isActive) {
        roomTargets.forEach((r) => r && io.to(r).emit("wordLimitReached"));
        return;
      }

      const currentWords = chat.messages.reduce(
        (sum, msg) => sum + msg.content.trim().split(/\s+/).length,
        0
      );

      const newWords = content.trim().split(/\s+/).length;

      if (currentWords + newWords > 500) {
        chat.isActive = false;
        await chat.save();
        roomTargets.forEach((r) => r && io.to(r).emit("wordLimitReached"));
        return;
      }
      const senderRole =
        socket.userId === interviewerUid ? "interviewer" : "interviewee";
      // Save the message
      const newMessage = {
        sender: senderRole,
        content,
        timestamp: new Date(),
      };

      chat.messages.push(newMessage);
      await chat.save();

      // Broadcast to joined rooms (use both raw meetingId and resolvedRoomId to reach all clients)
      roomTargets.forEach((r) => {
        if (!r) return;
        io.to(r).emit("newMessage", { ...newMessage, sender: senderRole });
      });
    } catch (error) {
      socket.emit("errorMessage", "Internal server error");
    }
  });

  // ---------------------------------------------------
  // DISCONNECT
  // ---------------------------------------------------
  socket.on("disconnect", (reason) => {});
});

export { io };

// Start server
server.listen(PORT);
// Server running on port