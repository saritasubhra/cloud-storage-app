import Directory from "../models/Directory.js";
import File from "../models/File.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getAllDescendantDirectoryIds } from "../utils/directoryHelpers.js";

// @route  POST /directories
// @body   { name, parent? }  - parent omitted/null => root-level folder
export const createDirectory = asyncHandler(async (req, res) => {
  const { name, parent = null } = req.body;

  // If a parent is given, make sure it exists, belongs to this user, and
  // isn't trashed (you have to restore it first)
  if (parent) {
    const parentDir = await Directory.findOne({
      _id: parent,
      owner: req.user._id,
      deletedAt: null,
    });
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
// Omit ?parent to list root-level contents. Trashed items never appear
// here - see routes/trashRoutes.js for the Trash view.
export const getDirectoryContents = asyncHandler(async (req, res) => {
  const parent = req.query.parent || null;

  if (parent) {
    const parentDir = await Directory.findOne({
      _id: parent,
      owner: req.user._id,
      deletedAt: null,
    });
    if (!parentDir) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }
  }

  const [directories, files] = await Promise.all([
    Directory.find({ owner: req.user._id, parent, deletedAt: null }).sort({
      name: 1,
    }),
    File.find({ owner: req.user._id, parent, deletedAt: null }).sort({
      name: 1,
    }),
  ]);

  res.status(200).json({
    success: true,
    data: { directories, files },
  });
});

// @route  PATCH /directories/:id
// @body   { name?, parent? }  - either or both may be supplied.
//         Send parent: null explicitly to move a folder to the root.
// Trashed folders can't be renamed/moved until restored.
export const updateDirectory = asyncHandler(async (req, res) => {
  const directory = await Directory.findOne({
    _id: req.params.id,
    owner: req.user._id,
    deletedAt: null,
  });

  if (!directory) {
    return res.status(404).json({
      success: false,
      message: "Folder not found",
    });
  }

  if (req.body.name !== undefined) {
    directory.name = req.body.name;
  }

  // Distinguish "parent not sent" (no move) from "parent: null" (move to root)
  if ("parent" in req.body) {
    const { parent } = req.body;

    if (parent) {
      if (parent === String(directory._id)) {
        return res.status(400).json({
          success: false,
          message: "Can't move a folder into itself",
        });
      }

      const targetParent = await Directory.findOne({
        _id: parent,
        owner: req.user._id,
        deletedAt: null,
      });
      if (!targetParent) {
        return res.status(404).json({
          success: false,
          message: "Target folder not found",
        });
      }

      // A folder can't be moved into one of its own subfolders - that
      // would disconnect it (and everything below it) from the tree.
      const descendantIds = await getAllDescendantDirectoryIds(
        directory._id,
        req.user._id,
      );
      const isMovingIntoOwnSubtree = descendantIds.some((id) =>
        id.equals(parent),
      );

      if (isMovingIntoOwnSubtree) {
        return res.status(400).json({
          success: false,
          message: "Can't move a folder into one of its own subfolders",
        });
      }
    }

    directory.parent = parent;
  }

  await directory.save(); // re-runs validation + unique index check

  res.status(200).json({
    success: true,
    message: "Folder updated successfully",
    data: directory,
  });
});

// @route  DELETE /directories/:id
// Soft delete - moves the folder and everything nested inside it (at any
// depth) to Trash. Nothing is removed from Cloudinary or the database yet;
// see routes/trashRoutes.js for restore/delete-forever/auto-purge.
export const deleteDirectory = asyncHandler(async (req, res) => {
  const directory = await Directory.findOne({
    _id: req.params.id,
    owner: req.user._id,
    deletedAt: null,
  });

  if (!directory) {
    return res.status(404).json({
      success: false,
      message: "Folder not found",
    });
  }

  const directoryIds = await getAllDescendantDirectoryIds(
    directory._id,
    req.user._id,
  );
  const now = new Date();

  await Directory.updateMany(
    { _id: { $in: directoryIds } },
    { $set: { deletedAt: now } },
  );
  await File.updateMany(
    { parent: { $in: directoryIds } },
    { $set: { deletedAt: now } },
  );

  res.status(200).json({
    success: true,
    message: "Moved to trash",
  });
});
