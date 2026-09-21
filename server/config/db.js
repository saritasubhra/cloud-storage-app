import mongoose from "mongoose";

// On Vercel, this module can be reused across requests within the same
// warm serverless instance, but the instance can also be re-initialized
// at any time. Caching the connection on `global` (rather than a plain
// module-level variable) survives module re-evaluation and prevents
// opening a new MongoDB connection on every invocation.
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

/**
 * Connects to MongoDB using Mongoose, reusing an existing connection
 * (or in-flight connection attempt) whenever possible.
 */
export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongooseInstance) => {
        console.log(`MongoDB connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null; // allow retrying on the next request/start
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// Optional: log runtime connection issues (e.g. network drop after startup)
mongoose.connection.on("error", (err) => {
  console.error(`MongoDB runtime error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});
