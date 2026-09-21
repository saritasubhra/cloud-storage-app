export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation errors (from our schema's required/match/minlength rules)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Mongoose duplicate key error (e.g. unique index violations)
  if (err.code === 11000) {
    statusCode = 409;
    const keys = Object.keys(err.keyValue || {});

    if (keys.includes("email")) {
      message = "An account with this email already exists";
    } else if (keys.includes("name")) {
      // Directory/File unique index on (owner, parent, name)
      message = `"${err.keyValue.name}" already exists in this location`;
    } else if (keys.includes("googleId")) {
      message = "This Google account is already linked to another user";
    } else if (keys.includes("publicId")) {
      message = "This file has already been uploaded";
    } else {
      message = `A record with this ${keys[0]} already exists`;
    }
  }

  // Multer errors (file too large, unexpected field, etc.)
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = `File is too large. Max allowed size is ${process.env.MAX_FILE_SIZE_MB || 25}MB`;
    } else {
      message = err.message;
    }
  }

  // Unsupported file type, thrown from middlewares/multer.js's fileFilter
  if (err.message && err.message.startsWith("File type")) {
    statusCode = 400;
    message = err.message;
  }

  // Malformed ObjectId passed in a route param
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message,
  });
};
