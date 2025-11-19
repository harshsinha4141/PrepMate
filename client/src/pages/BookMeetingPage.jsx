import { useState } from "react";
import {
  Calendar,
  Briefcase,
  Link2,
  Clock,
  CheckCircle,
  ArrowLeft,
  FileText,
  Sparkles,
  Coins,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
const BookMeetingPage = () => {
  const [roleName, setRoleName] = useState("");
  const [roleType, setRoleType] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const navigate = useNavigate();
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

  const handleBook = async () => {
    if (!roleName || !roleType || !timeSlot || !resumeLink) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Send datetime-local value directly - treat input as IST and store as UTC

      const res = await api.post(
        "/interviewee/book",
        {
          roleName,
          roleType,
          timeSlot: timeSlot, // Send datetime-local string directly
          resumeLink,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Booking response:", timeSlot);

      setBookingSuccess(true);
      setTimeout(() => {
        // navigate("/home");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/home");
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl shadow-slate-900/50 p-8 text-center border border-slate-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-900/30 rounded-full mb-6 border border-emerald-700/50">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-slate-300 mb-6">
            Your interview has been scheduled successfully. We're matching you
            with the perfect interviewer.
          </p>
          <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-cyan-300">
              <strong>50 coins</strong> will be deducted from your account
            </p>
          </div>
          <button
            onClick={handleBack}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-slate-400 hover:text-slate-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-100 mb-2">
                Book Your Practice Interview
              </h1>
              <p className="text-slate-400 text-lg">
                Schedule a session and get matched with an experienced
                interviewer
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-xl text-white shadow-lg shadow-cyan-500/50">
                <Sparkles className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/50 overflow-hidden border border-slate-700">
          {/* Cost Banner */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5" />
                <span className="font-semibold">Interview Cost</span>
              </div>
              <div className="text-2xl font-bold">50 Coins</div>
            </div>
          </div>

          <div className="p-8">
            {/* Role Type Selection */}
            <div className="mb-6">
              <label className="flex items-center text-sm font-semibold text-slate-300 mb-3">
                <Briefcase className="w-5 h-5 mr-2 text-cyan-400" />
                Role Type
              </label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 text-slate-200 p-4 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="">Select a role type</option>
                {roleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Name */}
            <div className="mb-6">
              <label className="flex items-center text-sm font-semibold text-slate-300 mb-3">
                <FileText className="w-5 h-5 mr-2 text-purple-400" />
                Specific Role Name
              </label>
              <input
                type="text"
                placeholder="e.g., Senior React Developer, Backend Engineer"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 text-slate-200 placeholder-slate-500 p-4 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
              <p className="mt-2 text-xs text-slate-500">
                Be specific about the role you're preparing for
              </p>
            </div>

            {/* Time Slot */}
            <div className="mb-6">
              <label className="flex items-center text-sm font-semibold text-slate-300 mb-3">
                <Calendar className="w-5 h-5 mr-2 text-emerald-400" />
                Preferred Date & Time
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full bg-slate-900 border-2 border-slate-700 text-slate-200 p-4 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                />
                <Clock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Enter your preferred time in IST (Indian Standard Time). All
                times are displayed in IST.
              </p>
            </div>

            {/* Resume Link */}
            <div className="mb-8">
              <label className="flex items-center text-sm font-semibold text-slate-300 mb-3">
                <Link2 className="w-5 h-5 mr-2 text-orange-400" />
                Resume Link
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/your-resume"
                value={resumeLink}
                onChange={(e) => setResumeLink(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 text-slate-200 placeholder-slate-500 p-4 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
              <p className="mt-2 text-xs text-slate-500">
                Share a Google Drive, Dropbox, or any publicly accessible link
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-cyan-900/20 border-l-4 border-cyan-500 p-4 rounded-lg mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-cyan-300">
                    <strong>What happens next?</strong>
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Our system will match you with a qualified interviewer based
                    on your role type and preferred time. You'll receive a
                    notification once matched!
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 border-2 border-slate-700 text-slate-300 py-4 rounded-xl font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5" />
                    <span>Confirm Booking (50 Coins)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-slate-800 rounded-xl p-4 shadow-md border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="bg-cyan-900/30 p-2 rounded-lg border border-cyan-700/50">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Flexible Scheduling
                </p>
                <p className="text-xs text-slate-400">24/7 availability</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 shadow-md border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-900/30 p-2 rounded-lg border border-purple-700/50">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Verified Interviewers
                </p>
                <p className="text-xs text-slate-400">Expert professionals</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 shadow-md border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-900/30 p-2 rounded-lg border border-emerald-700/50">
                <Coins className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Fair Pricing
                </p>
                <p className="text-xs text-slate-400">
                  Earn coins by helping others
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookMeetingPage;
