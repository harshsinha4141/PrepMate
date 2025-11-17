import axios from "axios";

// Use Vite environment variable `VITE_API_BASE_URL` if provided.
// In Vite, environment variables must be prefixed with `VITE_` and are available via `import.meta.env`.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // include cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
