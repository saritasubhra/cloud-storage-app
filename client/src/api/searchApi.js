import api from "./axios.js";

export const searchRequest = (query, type = "all") =>
  api.get("/search", { params: { q: query, type } });
