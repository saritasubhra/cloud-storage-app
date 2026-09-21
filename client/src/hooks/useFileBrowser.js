import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getDirectoryContentsRequest } from "../api/directoryApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const ROOT_CRUMB = { id: null, name: "My Files" };

export function useFileBrowser() {
  // Breadcrumb trail - the last entry is always the folder currently open.
  // Root is represented by id: null (matches the backend's convention
  // for a top-level parent).
  const [path, setPath] = useState([ROOT_CRUMB]);
  const [directories, setDirectories] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentFolderId = path[path.length - 1].id;

  const fetchContents = useCallback(async (folderId) => {
    setLoading(true);
    try {
      const res = await getDirectoryContentsRequest(folderId);
      setDirectories(res.data.data.directories);
      setFiles(res.data.data.files);
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't load this folder."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContents(currentFolderId);
  }, [currentFolderId, fetchContents]);

  const openFolder = (directory) => {
    setPath((prev) => [...prev, { id: directory._id, name: directory.name }]);
  };

  // Jump to any point in the breadcrumb trail, discarding everything after it
  const goToCrumb = (index) => {
    setPath((prev) => prev.slice(0, index + 1));
  };

  const refresh = () => fetchContents(currentFolderId);

  return {
    path,
    directories,
    files,
    loading,
    currentFolderId,
    openFolder,
    goToCrumb,
    refresh,
  };
}
