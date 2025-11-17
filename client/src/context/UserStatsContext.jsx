// src/context/UserStatsContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios"; // your axios instance

const UserStatsContext = createContext();

export const UserStatsProvider = ({ children }) => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const userId = localStorage.getItem("userId"); // stored after login
      if (!userId) return;

      const res = await api.get(`/users/stats/${userId}`);
      setUserStats(res.data);
    } catch (err) {
      console.error("Error fetching user stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // 🔄 Poll every 30 seconds for "real-time-ish" updates
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <UserStatsContext.Provider
      value={{ userStats, loading, refresh: fetchStats }}
    >
      {children}
    </UserStatsContext.Provider>
  );
};

export const useUserStats = () => useContext(UserStatsContext);
