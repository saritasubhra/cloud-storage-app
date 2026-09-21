import { Folder } from "lucide-react";
import { formatDate } from "../utils/formatDate.js";

function DirectoryRow({ directory, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(directory)}
      className="flex w-full items-center gap-4 border-b border-moss-light/60 px-2 py-3 text-left transition-colors hover:bg-paper-alt"
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <Folder className="shrink-0 text-moss" size={18} strokeWidth={1.75} />
        <span className="truncate text-ink">{directory.name}</span>
      </span>
      <span className="hidden w-20 shrink-0 text-sm text-ink-soft sm:block">—</span>
      <span className="w-24 shrink-0 text-sm text-ink-soft">{formatDate(directory.createdAt)}</span>
      <span className="w-8 shrink-0" aria-hidden="true" />
    </button>
  );
}

export default DirectoryRow;
