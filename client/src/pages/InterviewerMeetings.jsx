import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Clock, Mail, FileText, ChevronRight } from "lucide-react";
import api from "../api/axios";

const InterviewerMeetings = () => {
  const { type } = useParams();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/interviewerprofile/${type}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeetings(res.data.meetings);
      } catch (err) {
        // Error fetching meetings
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [type]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading meetings...</p>
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

        {/* Meetings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {meetings.length > 0 ? (
            meetings.map((m) => (
              <a
                key={m._id}
                href={`/meeting/${m._id}`}
                className="group relative block bg-slate-800 rounded-2xl shadow-lg shadow-slate-900/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-slate-700 hover:border-cyan-500/50"
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

                  {/* Candidate Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-cyan-500/50">
                        {m.intervieweeId?.userId?.firstName?.[0]}
                        {m.intervieweeId?.userId?.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-100 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                          {m.intervieweeId?.userId?.firstName}{" "}
                          {m.intervieweeId?.userId?.lastName}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-slate-400">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {m.intervieweeId?.userId?.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Info */}
                    {m.scheduledAt && (
                      <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3 flex-wrap border border-slate-700">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium">
                          {(() => {
                            // Convert UTC date back to IST by adding 5:30 hours
                            const date = new Date(m.scheduledAt);
                            const istDate = new Date(
                              date.getTime() + 5.5 * 60 * 60 * 1000
                            );
                            return istDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              timeZone: "UTC",
                            });
                          })()}
                        </span>
                        <Clock className="w-4 h-4 text-blue-400 ml-2" />
                        <span className="font-medium">
                          {(() => {
                            // Convert UTC time back to IST by adding 5:30 hours
                            const date = new Date(m.scheduledAt);
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

                    {/* Resume Link */}
                    {m.intervieweeId?.resumeUrl && (
                      <div className="pt-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(m.intervieweeId.resumeUrl, "_blank");
                          }}
                          className="inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md shadow-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/60"
                        >
                          <FileText className="w-4 h-4" />
                          View Resume
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewerMeetings;
