import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendTokenCookie } from "../utils/generateToken.js";

// @route  POST /auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email?.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
  }

  // Mongoose schema validation (required fields, email format, password length)
  // runs automatically here and throws a ValidationError if something's off,
  // which is caught by the global error handler.
  const user = await User.create({ name, email, password });

  sendTokenCookie(res, user._id);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: user,
  });
});

// @route  POST /auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  // password has `select: false` on the schema, so it must be explicitly requested
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  sendTokenCookie(res, user._id);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: user,
  });
});

// @route  POST /auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// @route  GET /auth/me  (protected)
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});
