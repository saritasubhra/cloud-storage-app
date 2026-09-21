import axios from "axios";

// Talks to the Express/Vercel backend built in previous steps.
// withCredentials is required so the httpOnly JWT cookie is sent/received.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export default api;
