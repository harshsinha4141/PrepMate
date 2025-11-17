import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import api from "../api/axios";

const SOCKET_URL = "http://localhost:5000";

const MeetingChat = ({ meetingId, meeting }) => {
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [totalWords, setTotalWords] = useState(0);
  const [loadingChat, setLoadingChat] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const getCurrentUserIdFromStorageOrToken = () => {
    const stored = localStorage.getItem("userId");
    if (stored) return stored;
    const t = localStorage.getItem("token");
    if (!t) return null;
    try {
      const parts = t.split(".");
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload?.userId || payload?.id || payload?._id || null;
    } catch (e) {
      return null;
    }
  };

  const currentUserId = getCurrentUserIdFromStorageOrToken();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!meetingId || !meeting) {
      setLoadingChat(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      setLoadingChat(false);
      return;
    }

    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket"] });

    socket.on("connect", () => {
      socket.emit("joinChat", meetingId);
    });

    socket.on("connect_error", () => {});
    socket.on("disconnect", () => {});

    socketRef.current = socket;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${meetingId}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        const chatData = res.data;
        setChat(chatData);
        setMessages(chatData.messages || []);
        setIsActive(chatData.isActive !== undefined ? chatData.isActive : true);
        const words = (chatData.messages || []).reduce(
          (sum, msg) => sum + (msg.content?.trim().split(/\s+/).length || 0),
          0
        );
        setTotalWords(words);
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error("Chat not found. Please start the chat first.");
        } else if (err.response?.status === 401) {
          toast.error("Please login again");
        } else {
          toast.error("Failed to load chat messages");
        }
      } finally {
        setLoadingChat(false);
      }
    };

    fetchMessages();

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTotalWords((prev) => prev + (msg.content?.trim().split(/\s+/).length || 0));
    });

    socket.on("wordLimitReached", () => {
      toast.warning("Word limit (500) reached! Chat is now locked.");
      setIsActive(false);
    });

    socket.on("errorMessage", (msg) => {
      toast.error(msg);
      setSending(false);
    });

    return () => {
      try {
        socket.disconnect();
      } catch (e) {}
    };
  }, [meetingId, meeting]);

  const getRefUserId = (ref) => {
    if (!ref) return null;
    const id = ref?.userId?._id || ref?._id || (typeof ref === "string" ? ref : null);
    return id ? id.toString() : null;
  };

  const interviewerId = getRefUserId(meeting?.interviewerId);
  const intervieweeId = getRefUserId(meeting?.intervieweeId);

  let inferredRole = "unknown";
  if (currentUserId && interviewerId && currentUserId.toString() === interviewerId.toString()) inferredRole = "interviewer";
  else inferredRole = "interviewee";

  const [currentUserRoleState, setCurrentUserRoleState] = useState(inferredRole);

  useEffect(() => {
    if (currentUserRoleState && currentUserRoleState !== "unknown") return;
    if (!currentUserId) return;
    const startedUsers = chat?.meetingId?.startedUsers || [];
    if (Array.isArray(startedUsers) && startedUsers.includes(currentUserId)) {
      const cInterviewer = getRefUserId(chat?.meetingId?.interviewerId) || interviewerId;
      if (cInterviewer && cInterviewer === currentUserId) {
        setCurrentUserRoleState("interviewer");
        return;
      }
      setCurrentUserRoleState("interviewee");
      return;
    }
    const cInterviewer = getRefUserId(chat?.meetingId?.interviewerId) || interviewerId;
    const cInterviewee = getRefUserId(chat?.meetingId?.intervieweeId) || intervieweeId;
    if (cInterviewer && currentUserId === cInterviewer) return setCurrentUserRoleState("interviewer");
    if (cInterviewee && currentUserId === cInterviewee) return setCurrentUserRoleState("interviewee");
    setCurrentUserRoleState("unknown");
  }, [chat, meeting, currentUserId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isActive || sending) return;
    const wordCount = newMessage.trim().split(/\s+/).length;
    if (totalWords + wordCount > 500) {
      toast.error("Word limit (500) exceeded.");
      return;
    }
    const msgData = { meetingId, sender: currentUserRoleState || inferredRole || "unknown", content: newMessage.trim() };
    setNewMessage("");
    setSending(true);
    socketRef.current?.emit("sendMessage", msgData);
    setTimeout(() => setSending(false), 500);
  };

  const remainingWords = 500 - totalWords;
  const progressPercentage = (totalWords / 500) * 100;

  if (loadingChat || !meetingId || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-cyan-500 mb-2"></div>
          <p className="text-slate-300 font-medium text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-slate-900">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-cyan-900/30 flex items-center justify-center mx-auto mb-2 border border-cyan-700/50">
            <MessageCircle className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-md font-bold text-slate-100 mb-1">No Chat Found</h2>
          <p className="text-sm text-slate-400">Chat session doesn't exist yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-4 text-xs"><p>Start the conversation!</p></div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === (currentUserRoleState || inferredRole) ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-3 py-1 rounded-xl text-sm shadow-lg ${msg.sender === (currentUserRoleState || inferredRole) ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-none shadow-cyan-500/50" : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"}`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 bg-slate-800 border-t border-slate-700 flex items-center gap-2">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={isActive ? "Type a message..." : "Chat locked"} className="flex-1 px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-800 disabled:opacity-50" disabled={!isActive || sending} autoComplete="off" />
        <button type="submit" disabled={sending || !isActive || !newMessage.trim() || (currentUserRoleState || inferredRole) === "unknown"} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-2 rounded-full hover:from-cyan-600 hover:to-blue-600 transition shadow-lg shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </form>

      <div className="p-2 text-center text-xs text-slate-400 bg-slate-800/50 border-t border-slate-700">
        <p className="mb-1 font-medium">Remaining words: {remainingWords} / 500</p>
        <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 transition-all shadow-lg shadow-cyan-500/50" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default MeetingChat;