import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Folder } from "lucide-react";
import Modal from "./Modal.jsx";
import Breadcrumbs from "./Breadcrumbs.jsx";
import Button from "./Button.jsx";
import Loader from "./Loader.jsx";
import { getDirectoryContentsRequest, updateDirectoryRequest } from "../api/directoryApi.js";
import { updateFileRequest } from "../api/fileApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const ROOT_CRUMB = { id: null, name: "My Files" };

function MoveModal({ item, itemType, currentParentId, onClose, onMoved }) {
  const [path, setPath] = useState([ROOT_CRUMB]);
  const [directories, setDirectories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const destinationId = path[path.length - 1].id;
  const label = itemType === "directory" ? "folder" : "file";
  const isSameLocation = destinationId === currentParentId;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await getDirectoryContentsRequest(destinationId);
        if (cancelled) return;

        // Can't move a folder into itself, so hide it from its own picker
        const options =
          itemType === "directory"
            ? res.data.data.directories.filter((d) => d._id !== item._id)
            : res.data.data.directories;

        setDirectories(options);
      } catch (error) {
        toast.error(getErrorMessage(error, "Couldn't load folders."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [destinationId, itemType, item._id]);

  const openFolder = (directory) => {
    setPath((prev) => [...prev, { id: directory._id, name: directory.name }]);
  };

  const goToCrumb = (index) => {
    setPath((prev) => prev.slice(0, index + 1));
  };

  const handleMoveHere = async () => {
    setSubmitting(true);
    try {
      const request = itemType === "directory" ? updateDirectoryRequest : updateFileRequest;
      const res = await request(item._id, { parent: destinationId });
      toast.success(`Moved "${item.name}"`);
      onMoved(res.data.data);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, `Couldn't move the ${label}.`));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Move "${item.name}"`} onClose={onClose}>
      <Breadcrumbs path={path} onNavigate={goToCrumb} />

      <div className="mt-4 h-56 overflow-y-auto rounded-sm border border-moss-light">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader label="Loading…" />
          </div>
        ) : directories.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-ink-soft">
            No subfolders here
          </p>
        ) : (
          directories.map((directory) => (
            <button
              key={directory._id}
              type="button"
              onClick={() => openFolder(directory)}
              className="flex w-full items-center gap-2.5 border-b border-moss-light/60 px-3 py-2.5 text-left text-sm text-ink last:border-b-0 hover:bg-paper-alt"
            >
              <Folder size={16} className="shrink-0 text-moss" strokeWidth={1.75} />
              <span className="truncate">{directory.name}</span>
            </button>
          ))
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          loading={submitting}
          disabled={isSameLocation}
          onClick={handleMoveHere}
        >
          Move here
        </Button>
      </div>
    </Modal>
  );
}

export default MoveModal;
