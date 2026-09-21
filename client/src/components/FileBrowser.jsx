import { useRef, useState } from "react";
import { toast } from "sonner";
import { FolderPlus, Upload } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs.jsx";
import DirectoryRow from "./DirectoryRow.jsx";
import FileRow from "./FileRow.jsx";
import EmptyFolder from "./EmptyFolder.jsx";
import NoSearchResults from "./NoSearchResults.jsx";
import SearchBar from "./SearchBar.jsx";
import Loader from "./Loader.jsx";
import Button from "./Button.jsx";
import CreateFolderModal from "./CreateFolderModal.jsx";
import RenameModal from "./RenameModal.jsx";
import MoveModal from "./MoveModal.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import UploadProgressPanel from "./UploadProgressPanel.jsx";
import { useFileBrowser } from "../hooks/useFileBrowser.js";
import { useFileUpload } from "../hooks/useFileUpload.js";
import { useSearch } from "../hooks/useSearch.js";
import { deleteDirectoryRequest } from "../api/directoryApi.js";
import { deleteFileRequest } from "../api/fileApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

function FileBrowser() {
  const { path, directories, files, loading, currentFolderId, openFolder, jumpToFolder, goToCrumb, refresh } =
    useFileBrowser();

  const [query, setQuery] = useState("");
  const { results: searchResults, loading: searching, isSearching, refresh: refreshSearch } =
    useSearch(query);

  const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // { action: "rename" | "move" | "delete", item, itemType: "directory" | "file" }
  const [activeAction, setActiveAction] = useState(null);
  const fileInputRef = useRef(null);

  const { uploads, uploadFiles, dismissUpload } = useFileUpload({ onUploaded: refresh });

  // Which set of items is currently on screen - search results while
  // there's an active query, otherwise the current folder's contents.
  const visibleDirectories = isSearching ? searchResults.directories : directories;
  const visibleFiles = isSearching ? searchResults.files : files;
  const isLoading = isSearching ? searching : loading;
  const isEmpty = !isLoading && visibleDirectories.length === 0 && visibleFiles.length === 0;

  const handleOpenDirectory = (directory) => {
    if (isSearching) {
      jumpToFolder(directory);
      setQuery(""); // leave search mode once we've navigated somewhere
    } else {
      openFolder(directory);
    }
  };

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

  // Refreshes whichever list is currently on screen
  const refreshVisible = () => (isSearching ? refreshSearch() : refresh());

  const handleDeleteConfirmed = async () => {
    const { item, itemType } = activeAction;
    try {
      const request = itemType === "directory" ? deleteDirectoryRequest : deleteFileRequest;
      await request(item._id);
      toast.success(`Deleted "${item.name}"`);
      refreshVisible();
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
        {isSearching ? (
          <p className="text-sm text-ink-soft">
            Search results for <span className="font-medium text-ink">"{query}"</span>
          </p>
        ) : (
          <Breadcrumbs path={path} onNavigate={goToCrumb} />
        )}

        <div className="flex flex-1 items-center justify-end gap-3">
          <SearchBar value={query} onChange={setQuery} />

          {!isSearching && (
            <>
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
            </>
          )}
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
          if (isSearching) return;
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={isSearching ? undefined : handleDrop}
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

        {isLoading ? (
          <div className="py-16">
            <Loader label={isSearching ? "Searching…" : "Loading folder…"} />
          </div>
        ) : isEmpty ? (
          isSearching ? <NoSearchResults query={query} /> : <EmptyFolder />
        ) : (
          <div>
            {visibleDirectories.map((directory) => (
              <DirectoryRow
                key={directory._id}
                directory={directory}
                onOpen={handleOpenDirectory}
                onRename={(item) => setActiveAction({ action: "rename", item, itemType: "directory" })}
                onMove={(item) => setActiveAction({ action: "move", item, itemType: "directory" })}
                onDelete={(item) => setActiveAction({ action: "delete", item, itemType: "directory" })}
              />
            ))}
            {visibleFiles.map((file) => (
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
          onRenamed={refreshVisible}
        />
      )}

      {activeAction?.action === "move" && (
        <MoveModal
          item={activeAction.item}
          itemType={activeAction.itemType}
          currentParentId={currentFolderId}
          onClose={closeAction}
          onMoved={refreshVisible}
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
