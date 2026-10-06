import { useMemo } from "react";
import { Folder, RotateCcw, Trash2 } from "lucide-react";
import { getFileIcon } from "../utils/getFileIcon.js";
import { formatDate } from "../utils/formatDate.js";

function TrashItemRow({ item, type, onRestore, onDeleteForever }) {
  // getFileIcon always returns one of a fixed set of lucide components
  // (a stable reference, not a new component per render).
  const FileIcon = useMemo(() => getFileIcon(item.mimeType), [item.mimeType]);
  const Icon = type === "directory" ? Folder : FileIcon;

  return (
    <div className="flex items-center gap-4 border-b border-moss-light/60 px-2 py-3">
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <Icon
          className={`shrink-0 ${type === "directory" ? "text-moss" : "text-ink-soft"}`}
          size={18}
          strokeWidth={1.75}
        />
        <span className="truncate text-ink">{item.name}</span>
      </span>
      <span className="hidden w-32 shrink-0 text-sm text-ink-soft sm:block">
        Deleted {formatDate(item.deletedAt)}
      </span>
      <div className="flex w-20 shrink-0 items-center justify-end gap-0.5">
        <button
          type="button"
          onClick={() => onRestore(item, type)}
          aria-label="Restore"
          title="Restore"
          className="rounded-sm p-1.5 text-ink-soft transition-colors hover:bg-paper-alt hover:text-ochre-dark"
        >
          <RotateCcw size={16} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => onDeleteForever(item, type)}
          aria-label="Delete forever"
          title="Delete forever"
          className="rounded-sm p-1.5 text-ink-soft transition-colors hover:bg-rust-light hover:text-rust"
        >
          <Trash2 size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

export default TrashItemRow;
