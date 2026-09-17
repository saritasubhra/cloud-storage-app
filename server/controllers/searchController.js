import Directory from "../models/Directory.js";
import File from "../models/File.js";
import asyncHandler from "../utils/asyncHandler.js";
import { escapeRegex } from "../utils/escapeRegex.js";

// @route  GET /search?q=<term>&type=all|file|directory
// Searches by name, case-insensitive, partial match, across the
// entire storage tree for the logged-in user (not limited to one folder).
export const search = asyncHandler(async (req, res) => {
  const { q, type = "all" } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({
      success: false,
      message: "A search query 'q' is required",
    });
  }

  const nameRegex = new RegExp(escapeRegex(q.trim()), "i");
  const owner = req.user._id;

  const [directories, files] = await Promise.all([
    type === "file"
      ? []
      : Directory.find({ owner, name: nameRegex }).sort({ name: 1 }),
    type === "directory"
      ? []
      : File.find({ owner, name: nameRegex }).sort({ name: 1 }),
  ]);

  res.status(200).json({
    success: true,
    data: { directories, files },
  });
});
