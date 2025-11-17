import axios from "axios";

// Create instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // change to your backend URL
  withCredentials: true, // include cookies
  headers: {
    "Content-Type": "application/json",
  },
});



export default api;
