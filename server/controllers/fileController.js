import path from "path";
import Directory from "../models/Directory.js";
import File from "../models/File.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { getCloudinaryResourceType } from "../utils/resourceType.js";
import { getAttachmentUrl } from "../utils/getAttachmentUrl.js";
import { hashBuffer } from "../utils/hashBuffer.js";

// @route  POST /files/upload
// @form   multipart/form-data, field name "file", optional body field "parent"
// Requires the `upload.single("file")` multer middleware to run first
// (see routes/fileRoutes.js), which populates req.file.
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file was uploaded",
    });
  }

  const { parent = null } = req.body;
  const allowDuplicate = req.body.allowDuplicate === "true";

  // Make sure the target folder exists, belongs to this user, and isn't
  // sitting in the trash (you have to restore it first)
  if (parent) {
    const parentDir = await Directory.findOne({
      _id: parent,
      owner: req.user._id,
      deletedAt: null,
    });
    if (!parentDir) {
      return res.status(404).json({
        success: false,
        message: "Target folder not found",
      });
    }
  }

  const hash = hashBuffer(req.file.buffer);

  // Content-based duplicate check - catches the same file re-uploaded
  // under a different name or into a different folder, which the
  // per-folder unique-name index alone wouldn't catch. We check this
  // BEFORE uploading to Cloudinary so a rejected/pending duplicate never
  // costs storage or an API call. Trashed files don't count as
  // duplicates - if your only copy is in the trash, re-uploading is fine.
  if (!allowDuplicate) {
    const existing = await File.findOne({
      owner: req.user._id,
      hash,
      deletedAt: null,
    });

    if (existing) {
      let location = "My Files";
      if (existing.parent) {
        const folder = await Directory.findById(existing.parent);
        if (folder) location = folder.name;
      }

      return res.status(409).json({
        success: false,
        isDuplicate: true,
        message: `You already have this file as "${existing.name}" in "${location}"`,
        data: {
          existingFile: {
            _id: existing._id,
            name: existing.name,
            location,
            createdAt: existing.createdAt,
          },
        },
      });
    }
  }

  const resourceType = getCloudinaryResourceType(req.file.mimetype);

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: req.user._id.toString(), // keeps each user's files in their own Cloudinary folder
    filename: req.file.originalname,
    resourceType,
  });

  const file = await File.create({
    name: req.file.originalname,
    originalName: req.file.originalname,
    owner: req.user._id,
    parent,
    url: result.secure_url,
    publicId: result.public_id,
    resourceType,
    mimeType: req.file.mimetype,
    extension: path.extname(req.file.originalname),
    size: result.bytes,
    hash,
  });

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: file,
  });
});

// @route  GET /files/:id/download
// Redirects to a Cloudinary URL that forces the browser to download
// the file (as opposed to opening/rendering it inline). Trashed files
// aren't downloadable until restored.
export const downloadFile = asyncHandler(async (req, res) => {
  const file = await File.findOne({
    _id: req.params.id,
    owner: req.user._id,
    deletedAt: null,
  });

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  const downloadUrl = getAttachmentUrl(file);

  res.redirect(downloadUrl);
});

// @route  PATCH /files/:id
// @body   { name?, parent? }  - either or both may be supplied.
//         Send parent: null explicitly to move a file to the root.
// Trashed files can't be renamed/moved until restored.
export const renameOrMoveFile = asyncHandler(async (req, res) => {
  const file = await File.findOne({
    _id: req.params.id,
    owner: req.user._id,
    deletedAt: null,
  });

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  if (req.body.name !== undefined) {
    file.name = req.body.name;
  }

  // Distinguish "parent not sent" (no move) from "parent: null" (move to root)
  if ("parent" in req.body) {
    const { parent } = req.body;

    if (parent) {
      const parentDir = await Directory.findOne({
        _id: parent,
        owner: req.user._id,
        deletedAt: null,
      });
      if (!parentDir) {
        return res.status(404).json({
          success: false,
          message: "Target folder not found",
        });
      }
    }

    file.parent = parent;
  }

  await file.save(); // re-runs validation + the unique (owner, parent, name) index check

  res.status(200).json({
    success: true,
    message: "File updated successfully",
    data: file,
  });
});

// @route  DELETE /files/:id
// Soft delete - moves the file to Trash rather than removing it right
// away. It's hidden from normal browsing/search immediately, but the
// Cloudinary asset and database record stick around for 30 days in case
// you want it back (see routes/trashRoutes.js for restore/delete-forever).
export const deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findOne({
    _id: req.params.id,
    owner: req.user._id,
    deletedAt: null,
  });

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  file.deletedAt = new Date();
  await file.save();

  res.status(200).json({
    success: true,
    message: "Moved to trash",
  });
});
