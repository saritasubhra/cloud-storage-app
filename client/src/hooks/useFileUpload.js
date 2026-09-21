import { useState } from "react";
import { toast } from "sonner";
import { uploadFileRequest } from "../api/fileApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

export function useFileUpload({ onUploaded } = {}) {
  // Each entry: { id, fileName, progress, status: "uploading"|"success"|"error", error? }
  const [uploads, setUploads] = useState([]);

  const patchUpload = (id, patch) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  const dismissUpload = (id) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const uploadOne = async (file, parentId) => {
    const id = crypto.randomUUID();
    setUploads((prev) => [...prev, { id, fileName: file.name, progress: 0, status: "uploading" }]);

    const formData = new FormData();
    formData.append("file", file);
    if (parentId) formData.append("parent", parentId);

    try {
      await uploadFileRequest(formData, {
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          patchUpload(id, { progress: percent });
        },
      });

      patchUpload(id, { progress: 100, status: "success" });
      // Tidy the panel automatically once a file finishes successfully
      setTimeout(() => dismissUpload(id), 2500);
      onUploaded?.();
    } catch (error) {
      const message = getErrorMessage(error, `Couldn't upload "${file.name}".`);
      patchUpload(id, { status: "error", error: message });
      toast.error(message);
    }
  };

  // Uploads run concurrently (not sequentially) - each file gets its own
  // progress entry so a slow file doesn't block the rest of the queue.
  const uploadFiles = (fileList, parentId) => {
    Array.from(fileList).forEach((file) => uploadOne(file, parentId));
  };

  return { uploads, uploadFiles, dismissUpload };
}
