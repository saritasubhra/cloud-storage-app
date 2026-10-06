import File from "../models/File.js";
import Directory from "../models/Directory.js";
import Share from "../models/Share.js";
import { deleteFromCloudinary } from "./cloudinaryUpload.js";
import { getAllDescendantDirectoryIds } from "./directoryHelpers.js";

/**
 * Permanently removes a set of File documents: their Cloudinary assets,
 * any share links pointing at them, and the documents themselves.
 * Safe to call with an empty array.
 */
export const permanentlyDeleteFiles = async (fileDocs) => {
  if (fileDocs.length === 0) return;

  await Promise.allSettled(
    fileDocs.map((file) => deleteFromCloudinary(file.publicId, file.resourceType))
  );

  const fileIds = fileDocs.map((f) => f._id);
  await Share.deleteMany({ file: { $in: fileIds } });
  await File.deleteMany({ _id: { $in: fileIds } });
};

/**
 * Permanently removes a directory and everything nested inside it, at any
 * depth - matching files (Cloudinary assets + docs) and all descendant
 * Directory documents. `directory` only needs `_id` and `owner`.
 */
export const permanentlyDeleteDirectoryTree = async (directory) => {
  const directoryIds = await getAllDescendantDirectoryIds(directory._id, directory.owner);

  // Regardless of each descendant's own deletedAt - once the root of a
  // trashed subtree is purged, everything beneath it goes with it.
  const files = await File.find({ parent: { $in: directoryIds } });
  await permanentlyDeleteFiles(files);

  await Directory.deleteMany({ _id: { $in: directoryIds } });
};
