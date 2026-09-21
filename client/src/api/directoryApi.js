import api from "./axios.js";

export const getDirectoryContentsRequest = (parentId) =>
  api.get("/directories", { params: parentId ? { parent: parentId } : {} });

export const createDirectoryRequest = (data) => api.post("/directories", data);

export const updateDirectoryRequest = (id, data) => api.patch(`/directories/${id}`, data);

export const deleteDirectoryRequest = (id) => api.delete(`/directories/${id}`);
