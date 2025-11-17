import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

const ReviewForm = () => {
  const { id } = useParams(); // meeting ID
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Detect if it's No-Show review
  const noShowMode = new URLSearchParams(window.location.search).get("noShow");

  // Prevent going back
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      navigate(0); // reload
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  // Auto-fill for No-Show mode
  useEffect(() => {
    if (noShowMode) {
      setRating(1);
      setFeedback("Interviewer did not join the meeting.");
    }
  }, [noShowMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");


      // ⭐ NORMAL REVIEW SUBMISSION
      await api.post(
        `/interviewee/review/${id}`,
        { rating, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(id);
      toast.success("Review submitted!");
      navigate("/home");
    } catch (err) {
      toast.error("❌ Failed to submit review");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 max-w-md w-full">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">
          {noShowMode
            ? "Interviewer No-Show"
            : "How was your interview experience?"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ⭐ Rating Block */}
          <div className="text-center">
            <label className="block mb-2 text-slate-300">Rating</label>

            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 w-full"
              disabled={noShowMode} // disable if no-show
            >
              {!noShowMode && <option value={0}>Select rating</option>}
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} Star{r > 1 && "s"}
                </option>
              ))}
            </select>
          </div>

          {/* ⭐ Feedback Block */}
          <div>
            <label className="block mb-2 text-slate-300">Feedback</label>

            <textarea
              rows="4"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2"
              placeholder="Share your thoughts..."
              disabled={noShowMode} // disable input for no-show
            />
          </div>

          {/* ⭐ Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg"
          >
            {noShowMode ? "Submit No-Show Review" : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
