import { Folder } from "lucide-react";
import { formatDate } from "../utils/formatDate.js";
import RowMenu from "./RowMenu.jsx";

function DirectoryRow({ directory, onOpen, onRename, onMove, onDelete }) {
  return (
    <div className="flex w-full items-center gap-4 border-b border-moss-light/60 px-2 py-3 transition-colors hover:bg-paper-alt">
      <button
        type="button"
        onClick={() => onOpen(directory)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <Folder className="shrink-0 text-moss" size={18} strokeWidth={1.75} />
        <span className="truncate text-ink">{directory.name}</span>
      </button>
      <span className="hidden w-20 shrink-0 text-sm text-ink-soft sm:block">—</span>
      <span className="w-24 shrink-0 text-sm text-ink-soft">{formatDate(directory.createdAt)}</span>
      <div className="flex w-16 shrink-0 items-center justify-end">
        <RowMenu
          onRename={() => onRename(directory)}
          onMove={() => onMove(directory)}
          onDelete={() => onDelete(directory)}
        />
      </div>
    </div>
  );
}

export default DirectoryRow;
