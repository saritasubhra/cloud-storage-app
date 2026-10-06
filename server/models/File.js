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
    // SHA-256 of the file's contents - lets us detect the same content
    // re-uploaded anywhere in the user's account, regardless of name/folder.
    hash: {
      type: String,
      required: true,
    },
    // Soft delete - null means active. A trashed file is hidden from
    // normal browsing/search but kept around for restore, and is
    // permanently removed by the purge job after 30 days.
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Speeds up "list files in this folder for this user" queries, and
// prevents two active files with the same name living in the same folder.
// partialFilterExpression means this uniqueness rule only applies to
// non-trashed files - a trashed file no longer blocks a new file (or a
// restore) from using the same name/location.
fileSchema.index(
  { owner: 1, parent: 1, name: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);

// Speeds up "does this user already have a file with this content"
// lookups (not unique - duplicates are allowed if the user confirms).
fileSchema.index({ owner: 1, hash: 1 });

// Speeds up the Trash view and the purge job's "older than 30 days" scan
fileSchema.index({ owner: 1, deletedAt: 1 });

const File = mongoose.model("File", fileSchema);

export default File;
