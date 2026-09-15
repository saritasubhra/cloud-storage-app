import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  getMe,
  googleCallback,
} from "../controllers/authController.js";
import checkAuth from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", checkAuth, getMe);

// Step 1: kicks off the Google consent screen.
// session: false -> Passport won't try to use express-session (we have none).
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// Step 2: Google redirects back here with a code; Passport exchanges it,
// runs the verify callback in config/passport.js, then we take over
// in googleCallback to issue our JWT cookie.
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${(process.env.CLIENT_URL || "").split(",")[0].trim()}/login`,
  }),
  googleCallback,
);

export default router;
