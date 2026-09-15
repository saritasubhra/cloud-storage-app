import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // e.g. http://localhost:5000/auth/google/callback
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const avatar = profile.photos?.[0]?.value || null;

        // 1. Already signed up with Google before -> log them in
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // 2. An account with this email exists (created via normal signup)
          //    -> link the Google id to that existing account
          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            user.avatar = user.avatar || avatar;
            await user.save();
          } else {
            // 3. Brand new user -> create an account.
            //    No password is set; the User model only requires a
            //    password when googleId is absent (see models/User.js).
            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              avatar,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

// NOTE: We deliberately do NOT use passport.serializeUser / deserializeUser
// or passport.session(). This app is fully stateless - once the Google
// strategy's verify callback resolves a user, we issue our own JWT cookie
// (see controllers/authController.js -> googleCallback) instead of relying
// on server-side session storage.

export default passport;
