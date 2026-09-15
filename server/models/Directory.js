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
  },
  { timestamps: true }
);

// Prevent two folders with the same name in the same location for the same user
directorySchema.index({ owner: 1, parent: 1, name: 1 }, { unique: true });

const Directory = mongoose.model("Directory", directorySchema);

export default Directory;
