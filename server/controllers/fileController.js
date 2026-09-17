import path from "path";
import Directory from "../models/Directory.js";
import File from "../models/File.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUpload.js";
import { getCloudinaryResourceType } from "../utils/resourceType.js";
import cloudinary from "../config/cloudinary.js";

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

  // Make sure the target folder exists and belongs to this user
  if (parent) {
    const parentDir = await Directory.findOne({
      _id: parent,
      owner: req.user._id,
    });
    if (!parentDir) {
      return res.status(404).json({
        success: false,
        message: "Target folder not found",
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
  });

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: file,
  });
});

// @route  GET /files/:id/download
// Redirects to a Cloudinary URL that forces the browser to download
// the file (as opposed to opening/rendering it inline).
export const downloadFile = asyncHandler(async (req, res) => {
  const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  const downloadUrl = cloudinary.url(file.publicId, {
    resource_type: file.resourceType,
    secure: true,
    flags: "attachment", // tells Cloudinary/browser to download rather than display
  });

  res.redirect(downloadUrl);
});

// @route  PATCH /files/:id
// @body   { name?, parent? }  - either or both may be supplied.
//         Send parent: null explicitly to move a file to the root.
export const renameOrMoveFile = asyncHandler(async (req, res) => {
  const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

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
export const deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  await deleteFromCloudinary(file.publicId, file.resourceType);
  await file.deleteOne();

  res.status(200).json({
    success: true,
    message: "File deleted successfully",
  });
});
