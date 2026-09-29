import api from "./axios.js";

export const createShareRequest = (data) => api.post("/shares", data);

export const listSharesRequest = (fileId) => api.get("/shares", { params: { file: fileId } });

export const revokeShareRequest = (id) => api.delete(`/shares/${id}`);

// Public endpoints - no auth needed, but they still go through the same
// axios instance (withCredentials is harmless here, just unused server-side)
export const resolvePublicShareRequest = (token) => api.get(`/shares/public/${token}`);

export const verifyPublicSharePasswordRequest = (token, password) =>
  api.post(`/shares/public/${token}/verify`, { password });
