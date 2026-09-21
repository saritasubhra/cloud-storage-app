import api from "./axios.js";

export const registerRequest = (data) => api.post("/auth/register", data);

export const loginRequest = (data) => api.post("/auth/login", data);

export const logoutRequest = () => api.post("/auth/logout");

export const getMeRequest = () => api.get("/auth/me");

// Google OAuth is a full-page redirect, not an XHR call - the backend
// handles the whole flow and redirects back to /auth/success on success.
export const googleLoginUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
