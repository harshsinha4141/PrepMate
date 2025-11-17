import { useState } from "react";
import api from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";

export default function RescheduleMeeting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeSlot, setTimeSlot] = useState("");

  const handleReschedule = async () => {
    const token = localStorage.getItem("token");

    await api.post(
      `/interview/reschedule/${id}`,
      { timeSlot },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <h1 className="text-cyan-400 text-2xl font-bold mb-6">
        Choose new interview time
      </h1>

      <input
        type="datetime-local"
        className="p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
        onChange={(e) => setTimeSlot(e.target.value)}
      />

      <button
        onClick={handleReschedule}
        className="mt-6 px-6 py-3 bg-cyan-600 text-white rounded-lg"
      >
        Submit
      </button>
    </div>
  );
}
