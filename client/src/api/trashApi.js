import api from "./axios.js";

export const listTrashRequest = () => api.get("/trash");

export const restoreItemRequest = (type, id) => api.post(`/trash/${type}/${id}/restore`);

export const deleteForeverRequest = (type, id) => api.delete(`/trash/${type}/${id}`);

export const emptyTrashRequest = () => api.delete("/trash");
