import app from "../app.js";
import { connectDB } from "../config/db.js";

// Vercel invokes this function on every request. connectDB() is cheap
// after the first call because config/db.js caches the connection
// across warm invocations of this same serverless instance.
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
