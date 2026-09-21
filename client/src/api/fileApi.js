import api from "./axios.js";

export const uploadFileRequest = (formData, config) =>
  api.post("/files/upload", formData, config);

// Not an XHR call - this is a URL for a plain top-level navigation
// (<a href>), so the browser follows the backend's redirect straight
// to Cloudinary and downloads the file.
export const getFileDownloadUrl = (fileId) =>
  `${import.meta.env.VITE_API_BASE_URL}/files/${fileId}/download`;

export const updateFileRequest = (id, data) => api.patch(`/files/${id}`, data);

export const deleteFileRequest = (id) => api.delete(`/files/${id}`);
