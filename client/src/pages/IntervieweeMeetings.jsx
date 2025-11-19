import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Video,
  Briefcase,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import ChatWidget from "../pages/ChatWidget";
import { io } from "socket.io-client";

const IntervieweeMeetings = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatExistsMap, setChatExistsMap] = useState({});
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const socketRef = useRef(null);
  const SOCKET_URL = "http://localhost:5000";

  useEffect(() => {
    if (!type) {
      navigate("/intervieweeprofile/upcoming");
      return;
    }

    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/intervieweeprofile/${type}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeetings(res.data.meetings || []);
      } catch (err) {
        toast.error("Failed to load meetings");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [type, navigate]);

  // Socket setup (runs once)
  useEffect(() => {
    const s = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket"],
    });

    socketRef.current = s;

    s.on("connect", () => {});

    s.on("interviewerStartedUpdate", ({ meetingId }) => {
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === meetingId || m.meetingId === meetingId
            ? { ...m, interviewerStarted: true }
            : m
        )
      );
    });

    s.on("disconnect", (reason) => {});

    // Listen for meeting ended events to navigate to review page
    s.on("meetingEnded", (data) => {
      console.log("🔴 Meeting ended event received:", data);
      toast.info(data.message || "The meeting has ended.");
      // Also refresh meetings to update the UI immediately
      fetchMeetings();
      // Navigate to review page
      setTimeout(() => {
        navigate(`/meetings/${data.meetingId}/review`);
      }, 1500);
    });

    // Add connection debugging
    s.on("connect", () => {
      console.log("✅ Socket connected in IntervieweeMeetings");
    });

    s.on("disconnect", () => {
      // Socket disconnected
    });

    return () => s.disconnect();
  }, []); // Empty - runs once

  // Join rooms when meetings load (runs when meetings change)
  useEffect(() => {
    if (!socketRef.current?.connected || meetings.length === 0) {
      return;
    }

    meetings.forEach((m) => {
      const roomId = m._id || m.meetingId;
      console.log("🏠 Joining room:", roomId);
      socketRef.current.emit("joinVideoRoom", roomId);
    });
  }, [meetings]);

  useEffect(() => {
    const checkChats = async () => {
      const token = localStorage.getItem("token");
      const results = {};

      for (const m of meetings) {
        try {
          // Use a consistent identifier: prefer DB _id, fallback to meetingId
          const id = m._id || m.meetingId;
          const res = await api.get(`/chat/messages/${id}`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.status === 200 && res.data?.messages) {
            results[id] = true;
          } else {
            results[id] = false;
          }
        } catch (err) {
          // If 404 it simply means chat not initialized yet
          if (err.response && err.response.status !== 404) {
          }
          const id = m._id || m.meetingId;
          results[id] = false;
        }
      }

      setChatExistsMap(results);
    };

    if (meetings.length > 0) checkChats();
  }, [meetings]);

  const handleChatClick = (meeting) => {
    const key = meeting._id || meeting.meetingId;
    if (
      isChatOpen &&
      (selectedMeeting?.meetingId || selectedMeeting?._id) === key
    ) {
      setIsChatOpen(false);
      setSelectedMeeting(null);
      return;
    }
    if (chatExistsMap[key]) {
      setSelectedMeeting(meeting);
      setIsChatOpen(true);
      return;
    }

    handleStartChat(meeting);
  };

  const handleStartChat = async (meeting) => {
    // Convert UTC stored time back to IST for comparison
    const storedDate = new Date(meeting.timeSlot);
    const istMeetingTime = new Date(
      storedDate.getTime() + 5.5 * 60 * 60 * 1000
    );
    const now = new Date();
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const diffMinutes = (istMeetingTime - istNow) / (1000 * 60);

    if (diffMinutes > 10) {
      toast.warning("Chat will be available 10 minutes before the meeting.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const id = meeting._id || meeting.meetingId;

      const res = await api.post(
        `/chat/start/${id}`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        const id = meeting._id || meeting.meetingId;
        setChatExistsMap((prev) => ({ ...prev, [id]: true }));
        setSelectedMeeting(meeting);
        setIsChatOpen(true);
      } else {
        toast.error(res.data?.message || "Failed to start chat.");
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.info("Chat already initialized. Opening chat widget.");
        const id = meeting._id || meeting.meetingId;
        setChatExistsMap((prev) => ({ ...prev, [id]: true }));
        setSelectedMeeting(meeting);
        setIsChatOpen(true);
      } else {
        toast.error(
          err.response?.data?.message ||
            "Something went wrong while starting chat."
        );
      }
    }
  };

  const handleJoinMeeting = async (meeting) => {
    try {
      // Check if meeting time has arrived
      const [datePart, timePart] = meeting.timeSlot.split("T");
      const [hour, minute] = timePart.split(":");
      const meetingTime = new Date(datePart + "T" + hour + ":" + minute);
      const now = new Date();

      if (now < meetingTime) {
        const hour24 = parseInt(hour);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? "PM" : "AM";
        const formattedTime = `${hour12}:${minute} ${ampm}`;
        const formattedDate = datePart;

        toast.warning(
          `Meeting will be available at the scheduled ${formattedDate} ${formattedTime} IST.`
        );
        return;
      }

      const token = localStorage.getItem("token");
      const id = meeting._id || meeting.meetingId;
      await api.post(
        `/video/interview/${id}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/video/${id}`);
    } catch (err) {
      toast.error("Unable to start meeting. Try again later.");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-700 border-blue-200",
      confirmed: "bg-green-100 text-green-700 border-green-200",
      completed: "bg-gray-100 text-gray-700 border-gray-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return (
      colors[status?.toLowerCase()] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-500 mb-4"></div>
          <p className="text-slate-300 font-medium">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2 capitalize">
            {type} Meetings
          </h1>
          <p className="text-slate-400">
            {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}{" "}
            found
          </p>
        </div>
        console,log(meetings);
        {/* Meetings Grid */}
        {meetings.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-900/30 to-blue-900/30 flex items-center justify-center mb-4 border border-cyan-800/50">
              <Calendar className="w-12 h-12 text-cyan-400" />
            </div>
            <p className="text-slate-300 text-lg font-medium">
              No {type} meetings found
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Check back later for updates
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {meetings.map((m) => (
              <div
                key={m._id}
                className="group relative bg-slate-800 rounded-2xl shadow-lg shadow-slate-900/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-slate-700"
              >
                {/* Gradient Border Effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ padding: "2px" }}
                >
                  <div className="h-full w-full bg-slate-800 rounded-2xl"></div>
                </div>

                <div className="relative p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getStatusColor(
                        m.status
                      )}`}
                    >
                      {m.status}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>

                  {/* Interviewer Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-cyan-500/50">
                        {
                          (m.interviewerId?.userId?.firstName ||
                            m.interviewerId?.firstName ||
                            "U")?.[0]
                        }
                        {
                          (m.interviewerId?.userId?.lastName ||
                            m.interviewerId?.lastName ||
                            "N")?.[0]
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-100 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                          {m.interviewerId?.userId?.firstName ||
                            m.interviewerId?.firstName ||
                            "Unknown"}{" "}
                          {m.interviewerId?.userId?.lastName ||
                            m.interviewerId?.lastName ||
                            "User"}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-slate-400">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {m.interviewerId?.userId?.email ||
                              m.interviewerId?.email ||
                              "No email"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {(m.interviewerId?.userId?.domain ||
                      m.interviewerId?.domain) && (
                      <div className="flex items-center gap-2 text-sm bg-purple-900/30 rounded-lg p-2 border border-purple-700/50">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-slate-300">
                          {m.interviewerId?.userId?.domain ||
                            m.interviewerId?.domain}
                        </span>
                      </div>
                    )}

                    {m.timeSlot && (
                      <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3 flex-wrap border border-slate-700">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium">
                          {(() => {
                            // Convert UTC date back to IST by adding 5:30 hours
                            const date = new Date(m.timeSlot);
                            const istDate = new Date(
                              date.getTime() + 5.5 * 60 * 60 * 1000
                            );
                            const day = String(istDate.getUTCDate()).padStart(
                              2,
                              "0"
                            );
                            const month = String(
                              istDate.getUTCMonth() + 1
                            ).padStart(2, "0");
                            const year = istDate.getUTCFullYear();
                            return `${day}/${month}/${year}`;
                          })()}
                        </span>
                        <Clock className="w-4 h-4 text-blue-400 ml-2" />
                        <span className="font-medium">
                          {(() => {
                            // Convert UTC time back to IST by adding 5:30 hours
                            const date = new Date(m.timeSlot);
                            const istDate = new Date(
                              date.getTime() + 5.5 * 60 * 60 * 1000
                            );
                            const hour24 = istDate.getUTCHours();
                            const minute = String(
                              istDate.getUTCMinutes()
                            ).padStart(2, "0");
                            const hour12 =
                              hour24 === 0
                                ? 12
                                : hour24 > 12
                                ? hour24 - 12
                                : hour24;
                            const ampm = hour24 >= 12 ? "PM" : "AM";
                            return `${hour12}:${minute} ${ampm} IST`;
                          })()}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-slate-700">
                      <button
                        onClick={() => handleChatClick(m)}
                        disabled={m.status === "completed"}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                          m.status === "completed"
                            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60"
                        }`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        {chatExistsMap[m._id || m.meetingId]
                          ? "Open Chat"
                          : "Start Chat"}
                      </button>
                      <button
                        onClick={() => handleJoinMeeting(m)}
                        disabled={
                          m.status === "completed" || !m.interviewerStarted
                        }
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                          m.status === "completed"
                            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                            : !m.interviewerStarted
                            ? "bg-slate-700 text-yellow-400 cursor-not-allowed border border-yellow-500/30"
                            : "bg-slate-900/50 text-cyan-400 border-2 border-cyan-500/50 hover:border-cyan-400 hover:bg-slate-900 shadow-lg hover:shadow-xl hover:shadow-cyan-500/30"
                        }`}
                      >
                        <Video
                          className={`w-5 h-5 ${
                            m.status === "completed"
                              ? "text-slate-500"
                              : !m.interviewerStarted
                              ? "text-yellow-400"
                              : "text-cyan-400"
                          }`}
                        />
                        Join Meeting
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Widget - Only render when open and meeting is selected */}
      <ChatWidget
        meetingId={selectedMeeting?.meetingId || selectedMeeting?._id}
        meeting={selectedMeeting}
        open={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
        }}
      />
    </div>
  );
};

export default IntervieweeMeetings;
