import "dotenv/config";
import express from "express";

import { connectDB } from "./config/db.js";

await connectDB();

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
