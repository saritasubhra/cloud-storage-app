import mongoose from "mongoose";

const directorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      minlength: [1, "Folder name cannot be empty"],
      maxlength: [255, "Folder name cannot exceed 255 characters"],
      // Disallow characters that cause problems in file systems / URLs
      match: [/^[^/\\:*?"<>|]+$/, "Folder name contains invalid characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // null parent = a root-level folder for that user
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Directory",
      default: null,
    },
    // Soft delete - null means active. See File.js for the full rationale;
    // the two models follow identical trash semantics.
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Prevent two active folders with the same name in the same location.
// partialFilterExpression means a trashed folder no longer blocks a new
// folder (or a restore) from using the same name/location.
directorySchema.index(
  { owner: 1, parent: 1, name: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);

// Speeds up the Trash view and the purge job's "older than 30 days" scan
directorySchema.index({ owner: 1, deletedAt: 1 });

const Directory = mongoose.model("Directory", directorySchema);

export default Directory;
