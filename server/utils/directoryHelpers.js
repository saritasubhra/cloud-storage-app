import Directory from "../models/Directory.js";

/**
 * Returns an array containing rootId plus the ids of every directory
 * nested inside it, at any depth (BFS level by level).
 * Used when deleting a folder, so we know every subfolder/file
 * that needs to be cleaned up along with it.
 */
export const getAllDescendantDirectoryIds = async (rootId, owner) => {
  const ids = [rootId];
  let frontier = [rootId];

  while (frontier.length > 0) {
    const children = await Directory.find({
      owner,
      parent: { $in: frontier },
    }).select("_id");

    if (children.length === 0) break;

    const childIds = children.map((c) => c._id);
    ids.push(...childIds);
    frontier = childIds;
  }

  return ids;
};
