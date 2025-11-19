import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Mail,
  FileText,
  Video,
  User,
  ArrowLeft,
  CheckCircle,
  MessageCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
// Import the ChatWidget component
import ChatWidget from "../pages/ChatWidget";

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatExists, setChatExists] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);
  // State to control the visibility of the floating chat widget
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get(`/interviewerprofile/meeting/${id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeeting(res.data.meeting);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [id]);

  useEffect(() => {
    const checkChatExists = async () => {
      if (!meeting) return;

      const id = meeting._id || meeting.meetingId;

      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/chat/messages/${id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });

        // If we successfully get messages, the chat exists
        if (res.status === 200 && res.data?.messages) {
          setChatExists(true);
        }
      } catch (err) {
        // If the chat API returns 404, we assume chat does not exist yet.
        if (err.response && err.response.status !== 404) {
        }
        setChatExists(false);
      } finally {
        setLoadingChat(false);
      }
    };

    checkChatExists();
  }, [meeting]);

  // Unified handler for the chat button click
  const handleChatClick = () => {
    // If the widget is already open, close it.
    if (isChatWidgetOpen) {
      setIsChatWidgetOpen(false);
      return;
    }

    // If chat exists, just open the widget locally without API call
    if (chatExists) {
      setIsChatWidgetOpen(true);
      return;
    }

    // If chat doesn't exist, proceed with starting the chat (API call and time check)
    handleStartChat();
  };

  const handleStartChat = async () => {
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
        // Success: set chat to exist and open the widget
        setChatExists(true);
        setIsChatWidgetOpen(true);
      } else {
        toast.error(res.data?.message || "Failed to start chat.");
      }
    } catch (err) {
      // Assuming 409 means chat already exists
      if (err.response?.status === 409) {
        toast.info("Chat already initialized. Opening chat widget.");
        setChatExists(true);
        setIsChatWidgetOpen(true);
      } else {
        toast.error(
          err.response?.data?.message ||
            "Something went wrong while starting chat."
        );
      }
    }
  };
  const isMeetingStarted = () => {
    if (!meeting) return false;
    // Convert UTC stored time to IST for comparison
    const storedDate = new Date(meeting.timeSlot);
    const istMeetingTime = new Date(
      storedDate.getTime() + 5.5 * 60 * 60 * 1000
    );
    const now = new Date();
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return istNow >= istMeetingTime; // meeting is ON or passed
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-cyan-900/30 text-cyan-400 border-cyan-700",
      confirmed: "bg-emerald-900/30 text-emerald-400 border-emerald-700",
      completed: "bg-slate-700/30 text-slate-400 border-slate-600",
      cancelled: "bg-red-900/30 text-red-400 border-red-700",
      pending: "bg-amber-900/30 text-amber-400 border-amber-700",
    };
    return (
      colors[status?.toLowerCase()] ||
      "bg-slate-700/30 text-slate-400 border-slate-600"
    );
  };
  const handleJoinMeeting = async (meeting) => {
    try {
      if (!isMeetingStarted()) {
        // Convert UTC time back to IST for display
        const date = new Date(meeting.timeSlot);
        const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
        const hour24 = istDate.getUTCHours();
        const minute = String(istDate.getUTCMinutes()).padStart(2, "0");
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? "PM" : "AM";
        const formattedTime = `${hour12}:${minute} ${ampm}`;
        const day = String(istDate.getUTCDate()).padStart(2, "0");
        const month = String(istDate.getUTCMonth() + 1).padStart(2, "0");
        const year = istDate.getUTCFullYear();
        const formattedDate = `${day}/${month}/${year}`;

        toast.warning(
          `Video call will be available at the scheduled ${formattedDate} ${formattedTime} IST.`
        );
        return;
      }
      // console.log(meeting);
      const token = localStorage.getItem("token");
      const id = meeting._id || meeting.meetingId;
      const res = await api.post(
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "scheduled":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-cyan-500 mb-4"></div>
          <p className="text-slate-300 font-medium text-lg">
            Loading meeting details...
          </p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-slate-800 rounded-3xl shadow-2xl p-10 max-w-md border border-slate-700">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-900/30 to-red-800/30 flex items-center justify-center mx-auto mb-6 border border-red-700">
            <Calendar className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-3">
            Meeting Not Found
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            The meeting you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-xl font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-100 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Meetings</span>
        </button>

        {/* Main Card */}
        <div className="bg-slate-800 rounded-3xl shadow-2xl overflow-hidden mb-6 border border-slate-700">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-900 px-6 sm:px-8 py-8 border-b border-cyan-800/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/50">
                  <span className="text-3xl font-bold text-white">
                    {
                      (meeting.intervieweeId?.userId?.firstName ||
                        meeting.intervieweeId?.firstName ||
                        "U")?.[0]
                    }
                    {
                      (meeting.intervieweeId?.userId?.lastName ||
                        meeting.intervieweeId?.lastName ||
                        "N")?.[0]
                    }
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2 leading-tight">
                    Meeting with{" "}
                    {meeting.intervieweeId?.userId?.firstName ||
                      meeting.intervieweeId?.firstName ||
                      "Unknown"}{" "}
                    {meeting.intervieweeId?.userId?.lastName ||
                      meeting.intervieweeId?.lastName ||
                      "User"}
                  </h1>
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm sm:text-base">
                      {meeting.intervieweeId?.userId?.email ||
                        meeting.intervieweeId?.email ||
                        "No email"}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 ${getStatusColor(
                  meeting.status
                )} backdrop-blur-sm shadow-sm flex-shrink-0`}
              >
                {getStatusIcon(meeting.status)}
                <span className="font-semibold capitalize text-sm">
                  {meeting.status}
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 bg-slate-800/50">
            {/* Info Cards Grid - Schedule and Candidate in One Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Schedule Info Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Schedule</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                    <Calendar className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Date
                      </p>
                      <p className="font-semibold text-slate-200">
                        {(() => {
                          // Convert UTC date back to IST by adding 5:30 hours
                          const date = new Date(meeting.timeSlot);
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
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                    <Clock className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Time
                      </p>
                      <p className="font-semibold text-slate-200">
                        {(() => {
                          // Convert UTC time back to IST by adding 5:30 hours
                          const date = new Date(meeting.timeSlot);
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
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Info Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 hover:border-purple-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Candidate Details
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Full Name
                    </p>
                    <p className="font-semibold text-slate-200">
                      {meeting.intervieweeId?.userId?.firstName ||
                        meeting.intervieweeId?.firstName ||
                        "Unknown"}{" "}
                      {meeting.intervieweeId?.userId?.lastName ||
                        meeting.intervieweeId?.lastName ||
                        "User"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Email Address
                    </p>
                    <p className="font-semibold text-slate-200 break-all">
                      {meeting.intervieweeId?.userId?.email ||
                        meeting.intervieweeId?.email ||
                        "No email"}
                    </p>
                  </div>
                  {meeting.intervieweeId?.resumeUrl && (
                    <a
                      href={meeting.intervieweeId.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold bg-slate-900/50 text-purple-400 px-5 py-3 rounded-xl hover:bg-purple-900/30 transition-all border border-slate-700 hover:border-purple-500/50 shadow-sm hover:shadow-md w-full justify-center"
                    >
                      <FileText className="w-4 h-4" />
                      View Resume
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center pt-6 border-t border-slate-700">
              <button
                onClick={() => handleJoinMeeting(meeting)}
                disabled={meeting.status === "completed" && !isMeetingStarted()}
                className={`w-full max-w-sm inline-flex items-center justify-center gap-3 bte px-8 py-4 rounded-xl cursor-pointer
                   ${
                     meeting.status === "completed"
                       ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                       : "bg-slate-900/50 text-cyan-400 border-2 border-cyan-500/50 hover:border-cyan-400 hover:bg-slate-900 shadow-lg hover:shadow-xl hover:shadow-cyan-500/30"
                   }
                    ${
                      isMeetingStarted()
                        ? "bg-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
              >
                <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Start Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-700">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-900/30 to-blue-900/30 flex items-center justify-center flex-shrink-0 border border-cyan-800/50">
              <AlertCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">
                Meeting Information
              </h3>
              <p className="text-slate-300 leading-relaxed">
                This meeting is scheduled with{" "}
                <span className="font-semibold text-slate-100">
                  {meeting.intervieweeId?.userId?.firstName ||
                    meeting.intervieweeId?.firstName ||
                    "the candidate"}
                </span>
                . Please ensure you're ready at the scheduled time. You can
                start the chat 10 minutes before the meeting begins. Click
                "Start Meeting" when you're prepared to begin the interview
                session.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      {!isChatWidgetOpen && (
        <button
          onClick={handleChatClick}
          disabled={meeting.status === "completed"}
          className={`fixed bottom-8 right-8 z-50 p-5 rounded-full text-white shadow-2xl transition-all duration-300 transform hover:scale-110 ${
            meeting.status === "completed"
              ? "bg-slate-700 cursor-not-allowed"
              : "bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-cyan-500/50 hover:shadow-cyan-500/70"
          }`}
        >
          <MessageCircle className="w-7 h-7" />
          {chatExists && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse shadow-lg shadow-emerald-500/50"></span>
          )}
        </button>
      )}

      {/* Chat Widget (Floating Component) */}
      {meeting && (
        <ChatWidget
          meetingId={meeting.meetingId || meeting._id}
          meeting={meeting}
          open={isChatWidgetOpen}
          onClose={() => setIsChatWidgetOpen(false)}
        />
      )}
    </div>
  );
};

export default MeetingDetails;
