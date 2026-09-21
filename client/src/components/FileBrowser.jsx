import { useRef, useState } from "react";
import { toast } from "sonner";
import { FolderPlus, Upload } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs.jsx";
import DirectoryRow from "./DirectoryRow.jsx";
import FileRow from "./FileRow.jsx";
import EmptyFolder from "./EmptyFolder.jsx";
import Loader from "./Loader.jsx";
import Button from "./Button.jsx";
import CreateFolderModal from "./CreateFolderModal.jsx";
import RenameModal from "./RenameModal.jsx";
import MoveModal from "./MoveModal.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import UploadProgressPanel from "./UploadProgressPanel.jsx";
import { useFileBrowser } from "../hooks/useFileBrowser.js";
import { useFileUpload } from "../hooks/useFileUpload.js";
import { deleteDirectoryRequest } from "../api/directoryApi.js";
import { deleteFileRequest } from "../api/fileApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

function FileBrowser() {
  const { path, directories, files, loading, currentFolderId, openFolder, goToCrumb, refresh } =
    useFileBrowser();

  const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // { action: "rename" | "move" | "delete", item, itemType: "directory" | "file" }
  const [activeAction, setActiveAction] = useState(null);
  const fileInputRef = useRef(null);

  const { uploads, uploadFiles, dismissUpload } = useFileUpload({ onUploaded: refresh });

  const isEmpty = !loading && directories.length === 0 && files.length === 0;

  const handleFileInputChange = (e) => {
    if (e.target.files?.length) {
      uploadFiles(e.target.files, currentFolderId);
    }
    e.target.value = ""; // allow re-selecting the same file later
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files, currentFolderId);
    }
  };

  const closeAction = () => setActiveAction(null);

  const handleDeleteConfirmed = async () => {
    const { item, itemType } = activeAction;
    try {
      const request = itemType === "directory" ? deleteDirectoryRequest : deleteFileRequest;
      await request(item._id);
      toast.success(`Deleted "${item.name}"`);
      refresh();
      closeAction();
    } catch (error) {
      toast.error(
        getErrorMessage(error, `Couldn't delete the ${itemType === "directory" ? "folder" : "file"}.`)
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Breadcrumbs path={path} onNavigate={goToCrumb} />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-auto"
            onClick={() => setCreateFolderOpen(true)}
          >
            <FolderPlus size={16} />
            New folder
          </Button>
          <Button type="button" className="w-auto" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`mt-6 rounded-sm border transition-colors ${
          isDragging ? "border-ochre bg-paper-alt" : "border-moss-light"
        }`}
      >
        {/* Column header - widths must match DirectoryRow/FileRow exactly */}
        <div className="flex items-center gap-4 border-b border-moss-light bg-paper-alt px-2 py-2 text-xs font-medium text-ink-soft">
          <span className="flex-1">Name</span>
          <span className="hidden w-20 shrink-0 sm:block">Size</span>
          <span className="w-24 shrink-0">Modified</span>
          <span className="w-16 shrink-0" aria-hidden="true" />
        </div>

        {loading ? (
          <div className="py-16">
            <Loader label="Loading folder…" />
          </div>
        ) : isEmpty ? (
          <EmptyFolder />
        ) : (
          <div>
            {directories.map((directory) => (
              <DirectoryRow
                key={directory._id}
                directory={directory}
                onOpen={openFolder}
                onRename={(item) => setActiveAction({ action: "rename", item, itemType: "directory" })}
                onMove={(item) => setActiveAction({ action: "move", item, itemType: "directory" })}
                onDelete={(item) => setActiveAction({ action: "delete", item, itemType: "directory" })}
              />
            ))}
            {files.map((file) => (
              <FileRow
                key={file._id}
                file={file}
                onRename={(item) => setActiveAction({ action: "rename", item, itemType: "file" })}
                onMove={(item) => setActiveAction({ action: "move", item, itemType: "file" })}
                onDelete={(item) => setActiveAction({ action: "delete", item, itemType: "file" })}
              />
            ))}
          </div>
        )}
      </div>

      {isCreateFolderOpen && (
        <CreateFolderModal
          parentId={currentFolderId}
          onClose={() => setCreateFolderOpen(false)}
          onCreated={refresh}
        />
      )}

      {activeAction?.action === "rename" && (
        <RenameModal
          item={activeAction.item}
          itemType={activeAction.itemType}
          onClose={closeAction}
          onRenamed={refresh}
        />
      )}

      {activeAction?.action === "move" && (
        <MoveModal
          item={activeAction.item}
          itemType={activeAction.itemType}
          currentParentId={currentFolderId}
          onClose={closeAction}
          onMoved={refresh}
        />
      )}

      {activeAction?.action === "delete" && (
        <ConfirmDialog
          title={`Delete ${activeAction.itemType === "directory" ? "folder" : "file"}`}
          message={
            activeAction.itemType === "directory"
              ? `"${activeAction.item.name}" and everything inside it will be permanently deleted. This can't be undone.`
              : `"${activeAction.item.name}" will be permanently deleted. This can't be undone.`
          }
          confirmLabel="Delete"
          onClose={closeAction}
          onConfirm={handleDeleteConfirmed}
        />
      )}

      <UploadProgressPanel uploads={uploads} onDismiss={dismissUpload} />
    </div>
  );
}

export default FileBrowser;
