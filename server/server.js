import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import passport from "passport";

import { connectDB } from "./config/db.js";
import "./config/passport.js"; // registers the Google strategy with passport
import authRoutes from "./routes/authRoutes.js";
import directoryRoutes from "./routes/directoryRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Connect to MongoDB before starting the server
await connectDB();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

// Security headers
app.use(helmet());

// Body parser + cookies
app.use(express.json());
app.use(cookieParser());

// CORS setup - only allow configured client origins, with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Passport - initialized only, no passport.session() since we use JWT cookies
// instead of server-side session storage.
app.use(passport.initialize());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running fine" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/directories", directoryRoutes);

// Global error handler (must be registered after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
