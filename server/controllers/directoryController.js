import Directory from "../models/Directory.js";
import File from "../models/File.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getAllDescendantDirectoryIds } from "../utils/directoryHelpers.js";
import { deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

// @route  POST /directories
// @body   { name, parent? }  - parent omitted/null => root-level folder
export const createDirectory = asyncHandler(async (req, res) => {
  const { name, parent = null } = req.body;

  // If a parent is given, make sure it exists and belongs to this user
  if (parent) {
    const parentDir = await Directory.findOne({ _id: parent, owner: req.user._id });
    if (!parentDir) {
      return res.status(404).json({
        success: false,
        message: "Parent folder not found",
      });
    }
  }

  // Mongoose validation (name pattern/length) + the unique index on
  // (owner, parent, name) are enforced here and surfaced by errorHandler.
  const directory = await Directory.create({
    name,
    parent,
    owner: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Folder created successfully",
    data: directory,
  });
});

// @route  GET /directories?parent=<id>
// Lists the subfolders and files directly inside the given folder.
// Omit ?parent to list root-level contents.
export const getDirectoryContents = asyncHandler(async (req, res) => {
  const parent = req.query.parent || null;

  if (parent) {
    const parentDir = await Directory.findOne({ _id: parent, owner: req.user._id });
    if (!parentDir) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }
  }

  const [directories, files] = await Promise.all([
    Directory.find({ owner: req.user._id, parent }).sort({ name: 1 }),
    File.find({ owner: req.user._id, parent }).sort({ name: 1 }),
  ]);

  res.status(200).json({
    success: true,
    data: { directories, files },
  });
});

// @route  PATCH /directories/:id
// @body   { name }
export const renameDirectory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const directory = await Directory.findOne({ _id: req.params.id, owner: req.user._id });

  if (!directory) {
    return res.status(404).json({
      success: false,
      message: "Folder not found",
    });
  }

  directory.name = name;
  await directory.save(); // re-runs validation + unique index check

  res.status(200).json({
    success: true,
    message: "Folder renamed successfully",
    data: directory,
  });
});

// @route  DELETE /directories/:id
// Recursively deletes the folder, every nested subfolder, and every
// file inside any of them (Cloudinary assets included).
export const deleteDirectory = asyncHandler(async (req, res) => {
  const directory = await Directory.findOne({ _id: req.params.id, owner: req.user._id });

  if (!directory) {
    return res.status(404).json({
      success: false,
      message: "Folder not found",
    });
  }

  const directoryIds = await getAllDescendantDirectoryIds(directory._id, req.user._id);

  const filesToDelete = await File.find({
    owner: req.user._id,
    parent: { $in: directoryIds },
  });

  // Best-effort cleanup on Cloudinary - a failed remote delete shouldn't
  // block removing the records from our own database.
  await Promise.allSettled(
    filesToDelete.map((file) => deleteFromCloudinary(file.publicId, file.resourceType))
  );

  await File.deleteMany({ owner: req.user._id, parent: { $in: directoryIds } });
  await Directory.deleteMany({ owner: req.user._id, _id: { $in: directoryIds } });

  res.status(200).json({
    success: true,
    message: "Folder and its contents deleted successfully",
  });
});
