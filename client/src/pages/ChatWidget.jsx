    // components/ChatWidget.jsx
    import React, { useState } from "react";
    import { MessageCircle, X } from "lucide-react";
    import MeetingChat from "./MeetingChat"; // your existing chat component

    const ChatWidget = ({ meetingId, meeting, open, onClose }) => {
        const currentUserId = localStorage.getItem("userId");
    if (!open) return null; // hide when not open
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat Box */}
        <div className="bg-slate-800 w-80 h-[500px] rounded-2xl shadow-2xl shadow-slate-900/50 flex flex-col overflow-hidden border border-slate-700">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
            <span className="font-semibold text-sm">
              Chat with{" "}
              {currentUserId === meeting?.interviewerId?.userId?._id
                ? meeting?.intervieweeId?.userId?.firstName
                : meeting?.interviewerId?.userId?.firstName}
            </span>
            <button
              onClick={onClose}
              className="hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Chat Area */}
          <div className="flex-1 overflow-hidden">
            <MeetingChat meetingId={meetingId} meeting={meeting} />
          </div>
        </div>
      </div>
    );
    };

    export default ChatWidget;
