import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
      minlength: [1, "File name cannot be empty"],
      maxlength: [255, "File name cannot exceed 255 characters"],
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // null parent = a root-level file for that user
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Directory",
      default: null,
    },
    url: {
      type: String,
      required: [true, "File URL is required"],
    },
    // Cloudinary's public_id - needed to delete/replace the file later
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    // Must match whatever resource_type Cloudinary stored the file under
    // (image / video / raw), so deletion and access work correctly
    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      default: "",
    },
    // Size in bytes
    size: {
      type: Number,
      required: true,
      min: [0, "File size cannot be negative"],
    },
  },
  { timestamps: true },
);

// Speeds up "list files in this folder for this user" queries, and
// prevents two files with the same name living in the same folder
// (matches the same rule enforced on Directory names).
fileSchema.index({ owner: 1, parent: 1, name: 1 }, { unique: true });

const File = mongoose.model("File", fileSchema);

export default File;
