import { useMemo } from "react";
import { Download } from "lucide-react";
import { getFileIcon } from "../utils/getFileIcon.js";
import { formatBytes } from "../utils/formatBytes.js";
import { formatDate } from "../utils/formatDate.js";
import { getFileDownloadUrl } from "../api/fileApi.js";
import RowMenu from "./RowMenu.jsx";

function FileRow({ file, onRename, onMove, onDelete }) {
  // getFileIcon always returns one of a fixed set of lucide components
  // (a stable reference, not a new component per render) - useMemo just
  // makes that explicit for the linter and future readers.
  const Icon = useMemo(() => getFileIcon(file.mimeType), [file.mimeType]);

  return (
    <div className="flex items-center gap-4 border-b border-moss-light/60 px-2 py-3">
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <Icon className="shrink-0 text-ink-soft" size={18} strokeWidth={1.75} />
        <span className="truncate text-ink">{file.name}</span>
      </span>
      <span className="hidden w-20 shrink-0 text-sm text-ink-soft sm:block">
        {formatBytes(file.size)}
      </span>
      <span className="w-24 shrink-0 text-sm text-ink-soft">{formatDate(file.createdAt)}</span>
      <div className="flex w-16 shrink-0 items-center justify-end gap-0.5">
        <a
          href={getFileDownloadUrl(file._id)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Download ${file.name}`}
          title="Download"
          className="rounded-sm p-1.5 text-ink-soft transition-colors hover:bg-paper-alt hover:text-ochre-dark"
        >
          <Download size={16} strokeWidth={1.75} />
        </a>
        <RowMenu
          onRename={() => onRename(file)}
          onMove={() => onMove(file)}
          onDelete={() => onDelete(file)}
        />
      </div>
    </div>
  );
}

export default FileRow;
