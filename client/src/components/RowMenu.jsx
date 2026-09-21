import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, FolderInput, Trash2 } from "lucide-react";

function RowMenu({ onRename, onMove, onDelete }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const runAndClose = (action) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-sm p-1.5 text-ink-soft transition-colors hover:bg-paper-alt hover:text-ink"
      >
        <MoreVertical size={16} strokeWidth={1.75} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-sm border border-moss-light bg-paper shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => runAndClose(onRename)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink hover:bg-paper-alt"
          >
            <Pencil size={14} strokeWidth={1.75} />
            Rename
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => runAndClose(onMove)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink hover:bg-paper-alt"
          >
            <FolderInput size={14} strokeWidth={1.75} />
            Move
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => runAndClose(onDelete)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-rust hover:bg-rust-light"
          >
            <Trash2 size={14} strokeWidth={1.75} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default RowMenu;
