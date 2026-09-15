import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Protects routes by requiring a valid JWT, read from the httpOnly cookie.
 * On success, attaches the authenticated user document to req.user.
 */
const checkAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated. Please log in.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid. Please log in again.",
    });
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User no longer exists.",
    });
  }

  req.user = user;
  next();
});

export default checkAuth;
