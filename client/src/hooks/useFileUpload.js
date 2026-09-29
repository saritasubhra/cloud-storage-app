import { useState } from "react";
import { toast } from "sonner";
import { uploadFileRequest } from "../api/fileApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

export function useFileUpload({ onUploaded } = {}) {
  // Each entry: { id, fileName, progress, status, error?, duplicateInfo?, file, parentId }
  // status: "uploading" | "success" | "error" | "duplicate"
  // "duplicate" pauses the upload and waits for the person to choose
  // "Upload anyway" or "Cancel" - file/parentId are kept on the entry so
  // the upload can be retried without asking the user to re-select it.
  const [uploads, setUploads] = useState([]);

  const patchUpload = (id, patch) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    );
  };

  const dismissUpload = (id) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const performUpload = async (
    id,
    file,
    parentId,
    { allowDuplicate = false } = {},
  ) => {
    patchUpload(id, { status: "uploading", progress: 0 });

    const formData = new FormData();
    formData.append("file", file);
    if (parentId) formData.append("parent", parentId);
    if (allowDuplicate) formData.append("allowDuplicate", "true");

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
      const isDuplicate =
        error?.response?.status === 409 && error?.response?.data?.isDuplicate;

      if (isDuplicate && !allowDuplicate) {
        // Pause here and let the UI ask the person what to do - keep the
        // original file/parentId so we can retry with allowDuplicate later.
        patchUpload(id, {
          status: "duplicate",
          duplicateInfo: error.response.data.data.existingFile,
          file,
          parentId,
        });
        return;
      }

      const message = getErrorMessage(error, `Couldn't upload "${file.name}".`);
      patchUpload(id, { status: "error", error: message });
      toast.error(message);
    }
  };

  const uploadOne = (file, parentId) => {
    const id = crypto.randomUUID();
    setUploads((prev) => [
      ...prev,
      { id, fileName: file.name, progress: 0, status: "uploading" },
    ]);
    performUpload(id, file, parentId);
  };

  // Uploads run concurrently (not sequentially) - each file gets its own
  // progress entry so a slow file doesn't block the rest of the queue.
  const uploadFiles = (fileList, parentId) => {
    Array.from(fileList).forEach((file) => uploadOne(file, parentId));
  };

  // Called from the "Upload anyway" button on a paused duplicate entry
  const keepDuplicate = (upload) => {
    performUpload(upload.id, upload.file, upload.parentId, {
      allowDuplicate: true,
    });
  };

  return { uploads, uploadFiles, dismissUpload, keepDuplicate };
}
