import axios from "axios";

// 🔄 Quick toggle for testing
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  "http://localhost:5000/api";     // 👈 LOCAL (uncomment to see console logs)
//   // "https://prepmate-7362.onrender.com/api"; // 👈 PRODUCTION (uncomment for deployed server)


// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // include cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
