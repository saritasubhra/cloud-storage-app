import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Info } from "lucide-react";
import Logo from "../components/Logo.jsx";
import Loader from "../components/Loader.jsx";
import Button from "../components/Button.jsx";
import TrashItemRow from "../components/TrashItemRow.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import {
  listTrashRequest,
  restoreItemRequest,
  deleteForeverRequest,
  emptyTrashRequest,
} from "../api/trashApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

function TrashPage() {
  const [loading, setLoading] = useState(true);
  const [directories, setDirectories] = useState([]);
  const [files, setFiles] = useState([]);
  // { kind: "delete-forever", item, type } | { kind: "empty-trash" } | null
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await listTrashRequest();
      setDirectories(res.data.data.directories);
      setFiles(res.data.data.files);
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't load trash."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const isEmpty = !loading && directories.length === 0 && files.length === 0;

  const handleRestore = async (item, type) => {
    try {
      await restoreItemRequest(type, item._id);
      toast.success(`Restored "${item.name}"`);
      fetchTrash();
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't restore this item."));
    }
  };

  const handleDeleteForeverConfirmed = async () => {
    const { item, type } = confirmAction;
    try {
      await deleteForeverRequest(type, item._id);
      toast.success(`"${item.name}" permanently deleted`);
      setConfirmAction(null);
      fetchTrash();
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't permanently delete this item."));
    }
  };

  const handleEmptyTrashConfirmed = async () => {
    try {
      await emptyTrashRequest();
      toast.success("Trash emptied");
      setConfirmAction(null);
      fetchTrash();
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't empty the trash."));
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-moss-light px-6 py-4">
        <Logo />
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={15} strokeWidth={1.75} />
          Back to Depot
        </Link>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-medium text-ink">Trash</h1>
          {!isEmpty && (
            <Button
              type="button"
              variant="outline"
              className="w-auto"
              onClick={() => setConfirmAction({ kind: "empty-trash" })}
            >
              <Trash2 size={16} />
              Empty trash
            </Button>
          )}
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-sm border border-moss-light bg-white/40 px-4 py-3 text-sm text-ink-soft">
          <Info size={16} className="mt-0.5 shrink-0 text-moss" strokeWidth={1.75} />
          <p>Items in Trash are permanently deleted after 30 days.</p>
        </div>

        <div className="mt-6 rounded-sm border border-moss-light">
          {loading ? (
            <div className="py-16">
              <Loader label="Loading trash…" />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <Trash2 className="text-moss" size={32} strokeWidth={1.5} />
              <div>
                <p className="font-medium text-ink">Trash is empty</p>
                <p className="mt-1 text-sm text-ink-soft">
                  Files and folders you delete will show up here for 30 days.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {directories.map((directory) => (
                <TrashItemRow
                  key={directory._id}
                  item={directory}
                  type="directory"
                  onRestore={handleRestore}
                  onDeleteForever={(item, type) => setConfirmAction({ kind: "delete-forever", item, type })}
                />
              ))}
              {files.map((file) => (
                <TrashItemRow
                  key={file._id}
                  item={file}
                  type="file"
                  onRestore={handleRestore}
                  onDeleteForever={(item, type) => setConfirmAction({ kind: "delete-forever", item, type })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmAction?.kind === "delete-forever" && (
        <ConfirmDialog
          title={`Delete ${confirmAction.type === "directory" ? "folder" : "file"} forever`}
          message={
            confirmAction.type === "directory"
              ? `"${confirmAction.item.name}" and everything inside it will be permanently deleted. This can't be undone.`
              : `"${confirmAction.item.name}" will be permanently deleted. This can't be undone.`
          }
          confirmLabel="Delete forever"
          onClose={() => setConfirmAction(null)}
          onConfirm={handleDeleteForeverConfirmed}
        />
      )}

      {confirmAction?.kind === "empty-trash" && (
        <ConfirmDialog
          title="Empty trash"
          message="Everything in Trash will be permanently deleted. This can't be undone."
          confirmLabel="Empty trash"
          onClose={() => setConfirmAction(null)}
          onConfirm={handleEmptyTrashConfirmed}
        />
      )}
    </div>
  );
}

export default TrashPage;
