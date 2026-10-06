import Directory from "../models/Directory.js";
import File from "../models/File.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getAllDescendantDirectoryIds } from "../utils/directoryHelpers.js";
import {
  permanentlyDeleteFiles,
  permanentlyDeleteDirectoryTree,
} from "../utils/trashHelpers.js";

const PURGE_AFTER_DAYS = 30;
const VALID_TYPES = ["file", "directory"];

const getModel = (type) => (type === "file" ? File : Directory);

// @route  GET /trash  (protected)
// Lists everything currently in this user's trash, newest-deleted first.
export const listTrash = asyncHandler(async (req, res) => {
  const [directories, files] = await Promise.all([
    Directory.find({ owner: req.user._id, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
    File.find({ owner: req.user._id, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
  ]);

  res.status(200).json({ success: true, data: { directories, files } });
});

// @route  POST /trash/:type/:id/restore  (protected)
// Restoring a folder also restores every currently-trashed item nested
// inside it, at any depth - otherwise you'd end up with a visible folder
// whose contents are still invisible.
export const restoreItem = asyncHandler(async (req, res) => {
  const { type, id } = req.params;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid item type" });
  }

  const Model = getModel(type);
  const item = await Model.findOne({ _id: id, owner: req.user._id, deletedAt: { $ne: null } });

  if (!item) {
    return res.status(404).json({ success: false, message: "Item not found in trash" });
  }

  // If the item lived inside a folder, that folder has to be restored
  // first - otherwise this item would become "active" while nested
  // inside a folder that's still invisible in normal browsing.
  if (item.parent) {
    const parentDir = await Directory.findOne({ _id: item.parent, owner: req.user._id });
    if (!parentDir) {
      return res.status(409).json({
        success: false,
        message: "The parent folder no longer exists",
      });
    }
    if (parentDir.deletedAt) {
      return res.status(409).json({
        success: false,
        message: "Restore the parent folder first",
      });
    }
  }

  if (type === "directory") {
    // Restore this folder and everything currently trashed beneath it.
    // Note: this isn't wrapped in a transaction, so if a name collision
    // (against an item created after the original was trashed) occurs
    // partway through, some descendants may already be restored before
    // the error surfaces - re-running restore after resolving the
    // conflicting name will pick up where it left off (already-restored
    // items are simply skipped since they no longer match the query).
    const descendantIds = await getAllDescendantDirectoryIds(item._id, req.user._id);

    await Directory.updateMany({ _id: { $in: descendantIds } }, { $set: { deletedAt: null } });
    await File.updateMany({ parent: { $in: descendantIds } }, { $set: { deletedAt: null } });
  } else {
    item.deletedAt = null;
    await item.save(); // re-runs the unique (owner, parent, name) index check
  }

  res.status(200).json({ success: true, message: "Restored" });
});

// @route  DELETE /trash/:type/:id  (protected)
// Permanently deletes one trashed item - Cloudinary asset(s) included.
// This is the only route that actually removes data; everything else in
// this file is reversible up to this point.
export const deleteForever = asyncHandler(async (req, res) => {
  const { type, id } = req.params;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid item type" });
  }

  const Model = getModel(type);
  const item = await Model.findOne({ _id: id, owner: req.user._id, deletedAt: { $ne: null } });

  if (!item) {
    return res.status(404).json({ success: false, message: "Item not found in trash" });
  }

  if (type === "file") {
    await permanentlyDeleteFiles([item]);
  } else {
    await permanentlyDeleteDirectoryTree(item);
  }

  res.status(200).json({ success: true, message: "Permanently deleted" });
});

// @route  DELETE /trash  (protected)
// Empties the trash entirely for this user.
export const emptyTrash = asyncHandler(async (req, res) => {
  const trashedDirectories = await Directory.find({
    owner: req.user._id,
    deletedAt: { $ne: null },
  });

  // Each call purges its whole subtree - safe even with overlapping
  // subtrees (a nested trashed folder under another trashed folder),
  // since removing an already-removed document is a harmless no-op.
  for (const directory of trashedDirectories) {
    await permanentlyDeleteDirectoryTree(directory);
  }

  // Re-query after the directory purge so files already removed via a
  // folder's cascade aren't processed a second time.
  const remainingTrashedFiles = await File.find({
    owner: req.user._id,
    deletedAt: { $ne: null },
  });
  await permanentlyDeleteFiles(remainingTrashedFiles);

  res.status(200).json({ success: true, message: "Trash emptied" });
});

// @route  GET /trash/purge-expired  (cron only - see routes/trashRoutes.js)
// Permanently deletes anything that has been in the trash for more than
// 30 days, across every user. Not scoped to req.user since this is a
// system maintenance job, not a user-initiated action - it's invoked by
// Vercel Cron on a schedule (see vercel.json) rather than through the UI.
export const purgeExpiredTrash = asyncHandler(async (req, res) => {
  const cutoff = new Date(Date.now() - PURGE_AFTER_DAYS * 24 * 60 * 60 * 1000);

  const expiredDirectories = await Directory.find({ deletedAt: { $ne: null, $lt: cutoff } });
  for (const directory of expiredDirectories) {
    await permanentlyDeleteDirectoryTree(directory);
  }

  // Re-query after the directory purge for the same reason as emptyTrash
  const expiredFiles = await File.find({ deletedAt: { $ne: null, $lt: cutoff } });
  await permanentlyDeleteFiles(expiredFiles);

  res.status(200).json({
    success: true,
    message: "Expired trash purged",
    data: {
      purgedDirectories: expiredDirectories.length,
      purgedFiles: expiredFiles.length,
    },
  });
});
