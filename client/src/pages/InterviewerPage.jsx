import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import {
  Calendar,
  Clock,
  Briefcase,
  User,
  ExternalLink,
  CheckCircle,
  Loader2,
  AlertCircle,
  TrendingUp,
  Star,
  Coins,
  Video,
  FileText,
  Award,
  Filter,
  X,
} from "lucide-react";

const roleTypes = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Mobile Developer",
];
export default function InterviewerPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const filteredMeetings = useMemo(() => {
    let filtered = [...meetings];

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter((m) => m.roleName === selectedRole);
    }

    // Filter by date
    if (selectedDateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((m) => {
        const meetingDate = new Date(m.timeSlot);
        const diffHours = (meetingDate - now) / (1000 * 60 * 60);
        const diffDays = diffHours / 24;

        switch (selectedDateFilter) {
          case "today":
            return meetingDate.toDateString() === now.toDateString();
          case "tomorrow":
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return meetingDate.toDateString() === tomorrow.toDateString();
          case "week":
            return diffDays <= 7 && diffDays >= 0;
          default:
            return true;
        }
      });
    }

    // Filter by time of day
    if (selectedTimeFilter !== "all") {
      filtered = filtered.filter((m) => {
        const meetingDate = new Date(m.timeSlot);
        const meetingHour = meetingDate.getHours();

        switch (selectedTimeFilter) {
          case "morning":
            return meetingHour >= 6 && meetingHour < 12;
          case "afternoon":
            return meetingHour >= 12 && meetingHour < 17;
          case "evening":
            return meetingHour >= 17 && meetingHour < 21;
          case "night":
            return meetingHour >= 21 || meetingHour < 6;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.roleName?.toLowerCase().includes(query) ||
          m.roleType?.toLowerCase().includes(query) ||
          m.interviewee?.level?.toLowerCase().includes(query)
      );
    }

    // Sort by date (earliest first)
    filtered.sort((a, b) => new Date(a.timeSlot) - new Date(b.timeSlot));

    return filtered;
  }, [
    meetings,
    selectedRole,
    selectedDateFilter,
    selectedTimeFilter,
    searchQuery,
  ]);

  const activeFiltersCount = [
    selectedRole !== "all",
    selectedDateFilter !== "all",
    selectedTimeFilter !== "all",
    searchQuery.trim() !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedRole("all");
    setSelectedDateFilter("all");
    setSelectedTimeFilter("all");
    setSearchQuery("");
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get(
          `/interviewer/pending?page=${page}&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMeetings(res.data.meetings || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Failed to load meetings:", err);
        toast.error("Failed to load meetings");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [page]); // 👈 re-run when page changes

  const acceptMeeting = async (meetingId) => {
    try {
      setAcceptingId(meetingId);
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/interviewer/accept/${meetingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  toast.success(res.data.message || "Meeting accepted successfully!");
      // Remove accepted meeting from list
      const updated = meetings.filter((m) => m.meetingId !== meetingId);
      const sorted = updated.sort((a, b) => {
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return new Date(a.timeSlot) - new Date(b.timeSlot);
      });

      setMeetings(sorted);
    } catch (err) {
      console.error("Failed to accept meeting:", err);
      toast.error(err.response?.data?.message || "Failed to accept meeting");
    } finally {
      setAcceptingId(null);
    }
  };

 const formatDate = (dateString) => {
   const date = new Date(dateString);

   return {
     day: date.toLocaleDateString("en-IN", {
       timeZone: "Asia/Kolkata",
       weekday: "short",
       year: "numeric",
       month: "short",
       day: "numeric",
     }),
     time: date.toLocaleTimeString("en-IN", {
       timeZone: "Asia/Kolkata",
       hour: "2-digit",
       minute: "2-digit",
     }),
   };
 };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-100">
                Interviewer Dashboard
              </h1>
              <p className="text-slate-400 mt-1">
                Review and accept pending interview requests
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 rounded-xl text-white shadow-lg shadow-cyan-500/50">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold text-lg">
                  Available Interview Requests
                </span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="font-bold">{meetings.length} Pending</span>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-slate-100">
                    Filters
                  </h2>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-1 bg-cyan-600 text-white text-xs font-bold rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear all</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search role, type, level..."
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    {roleTypes.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Date
                  </label>
                  <select
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="week">This Week</option>
                  </select>
                </div>

                {/* Time of Day Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Time of Day
                  </label>
                  <select
                    value={selectedTimeFilter}
                    onChange={(e) => setSelectedTimeFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
                  >
                    <option value="all">All Times</option>
                    <option value="morning">Morning (6 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 9 PM)</option>
                    <option value="night">Night (9 PM - 6 AM)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                <p className="text-slate-400">Loading available meetings...</p>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-full mb-4">
                  <AlertCircle className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  No Pending Meetings
                </h3>
                <p className="text-slate-400">
                  Check back later for new interview requests
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredMeetings.map((m) => {
                    const dateInfo = formatDate(m.timeSlot);
                    const isAccepting = acceptingId === m.meetingId;

                    return (
                      <div
                        key={m._id}
                        className={`relative rounded-xl p-6 transition-all duration-200 
    ${
      m.priority
        ? "border-2 border-red-500 shadow-red-500/30 shadow-lg bg-red-950/20"
        : "border-2 border-slate-700 bg-slate-900"
    }  
  `}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          {m.priority && (
                            <div className="absolute top-3 right-3 bg-red-500/20 border border-red-500 text-red-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                              🔥 High Priority
                            </div>
                          )}

                          {/* Left Section - Meeting Details */}
                          <div className="flex-1 space-y-4">
                            {/* Role Info */}
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <Briefcase className="w-5 h-5 text-cyan-400" />
                                <span className="text-sm font-medium text-slate-400">
                                  Position
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-slate-100">
                                {m.roleName}
                              </h3>
                              <span className="inline-block mt-1 px-3 py-1 bg-cyan-900/30 border border-cyan-700/50 text-cyan-400 text-sm font-medium rounded-full">
                                {m.roleType}
                              </span>
                            </div>

                            {/* Time & Date */}
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center space-x-2">
                                <div className="bg-cyan-900/30 border border-cyan-700/50 p-2 rounded-lg">
                                  <Calendar className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Date</p>
                                  <p className="text-sm font-semibold text-slate-200">
                                    {dateInfo.day}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <div className="bg-emerald-900/30 border border-emerald-700/50 p-2 rounded-lg">
                                  <Clock className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Time</p>
                                  <p className="text-sm font-semibold text-slate-200">
                                    {dateInfo.time}
                                  </p>
                                </div>
                              </div>

                              {m.interviewee && (
                                <div className="flex items-center space-x-2">
                                  <div className="bg-purple-900/30 border border-purple-700/50 p-2 rounded-lg">
                                    <User className="w-4 h-4 text-purple-400" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">
                                      Candidate
                                    </p>
                                    <p className="text-sm font-semibold text-slate-200">
                                      {m.interviewee.level}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Interviewee Rating */}
                            {m.interviewee && (
                              <div className="flex items-center space-x-2 bg-orange-900/30 border border-orange-700/50 rounded-lg p-3 w-fit">
                                <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                                <span className="text-sm font-semibold text-orange-300">
                                  {m.interviewee.rating} Rating
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right Section - Actions */}
                          <div className="flex flex-col space-y-3 lg:w-64">
                            <a
                              href={m.resumeLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-900 border border-slate-700 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              <span>View Resume</span>
                              <ExternalLink className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => acceptMeeting(m.meetingId)}
                              disabled={isAccepting}
                              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isAccepting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Accepting...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Accept & Start</span>
                                </>
                              )}
                            </button>

                            <div
                              className={`rounded-lg p-3 text-center border ${
                                m.priority
                                  ? "bg-red-900/30 border-red-700/50"
                                  : "bg-emerald-900/30 border-emerald-700/50"
                              }`}
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <Coins
                                  className={`w-4 h-4 ${
                                    m.priority
                                      ? "text-red-400"
                                      : "text-emerald-400"
                                  }`}
                                />
                                <span
                                  className={`text-sm font-bold ${
                                    m.priority
                                      ? "text-red-400"
                                      : "text-emerald-400"
                                  }`}
                                >
                                  Earn {m.priority ? 100 : 50} Coins
                                </span>
                              </div>

                              {m.priority && (
                                <p className="text-xs text-red-300 mt-1">
                                  Bonus for taking over a missed interview
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Pagination - FIXED POSITION */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-3">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className={`px-4 py-2 rounded-lg font-semibold 
              ${
                page === 1
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-slate-800 text-cyan-400 border border-cyan-600 hover:bg-slate-700"
              }`}
                    >
                      Previous
                    </button>

                    <span className="text-slate-300 font-medium mt-2">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className={`px-4 py-2 rounded-lg font-semibold 
              ${
                page === totalPages
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-slate-800 text-cyan-400 border border-cyan-600 hover:bg-slate-700"
              }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-cyan-900/20 border-l-4 border-cyan-500 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-cyan-300">
                Interview Guidelines
              </h3>
              <div className="mt-2 text-sm text-slate-400">
                <ul className="list-disc list-inside space-y-1">
                  <li>Review the candidate's resume before accepting</li>
                  <li>Prepare relevant questions based on the role</li>
                  <li>
                    Maintain professionalism and provide constructive feedback
                  </li>
                  <li>Each completed interview earns you 50 coins</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
