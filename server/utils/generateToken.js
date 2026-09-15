import jwt from "jsonwebtoken";

/**
 * Signs a JWT containing the user's id.
 */
export const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Signs a JWT for the given user and sets it as an httpOnly cookie
 * on the response. Also used by the Google OAuth flow later on.
 */
export const sendTokenCookie = (res, userId) => {
  const token = signToken(userId);

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? "none" : "lax", // "none" needed for cross-site (Vercel) cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, keep in sync with JWT_EXPIRES_IN
  });

  return token;
};
