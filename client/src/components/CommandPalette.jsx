import { useEffect, useMemo, useState } from "react";
import { Search, FolderPlus, Upload, Folder } from "lucide-react";
import { useSearch } from "../hooks/useSearch.js";
import { getFileIcon } from "../utils/getFileIcon.js";

function CommandPalette({ onClose, onNewFolder, onUpload, onOpenFolder, onOpenFile }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const { results, loading } = useSearch(query);

  const staticCommands = useMemo(
    () => [
      { type: "command", id: "new-folder", label: "New folder", icon: FolderPlus, action: onNewFolder },
      { type: "command", id: "upload", label: "Upload files", icon: Upload, action: onUpload },
    ],
    [onNewFolder, onUpload]
  );

  const items = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const commands = trimmed
      ? staticCommands.filter((c) => c.label.toLowerCase().includes(trimmed))
      : staticCommands;

    const directories = results.directories.map((d) => ({
      type: "directory",
      id: d._id,
      label: d.name,
      data: d,
    }));
    const files = results.files.map((f) => ({
      type: "file",
      id: f._id,
      label: f.name,
      data: f,
    }));

    return [...commands, ...directories, ...files];
  }, [query, staticCommands, results]);

  // Reset the highlighted row whenever the list changes, so it never
  // points past the end (e.g. after search results shrink)
  useEffect(() => setActiveIndex(0), [items.length, query]);

  const executeItem = (item) => {
    if (!item) return;
    if (item.type === "command") item.action();
    else if (item.type === "directory") onOpenFolder(item.data);
    else if (item.type === "file") onOpenFile(item.data);
    onClose();
  };

  // A document-level listener (rather than attaching only to the input)
  // so arrow/enter/escape work even if focus has moved to a list item.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        executeItem(items[activeIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, activeIndex]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-[15vh]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-sm border border-moss-light bg-paper shadow-lg"
      >
        <div className="flex items-center gap-3 border-b border-moss-light px-4 py-3">
          <Search size={16} className="shrink-0 text-ink-soft" strokeWidth={1.75} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files and folders, or type a command…"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
          />
          <kbd className="shrink-0 rounded-sm border border-moss-light px-1.5 py-0.5 text-xs text-ink-soft">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-1.5">
          {loading && (
            <p className="px-4 py-3 text-sm text-ink-soft">Searching…</p>
          )}

          {!loading && items.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-soft">No matches</p>
          )}

          {items.map((item, index) => (
            <PaletteRow
              key={`${item.type}-${item.id}`}
              item={item}
              active={index === activeIndex}
              onHover={() => setActiveIndex(index)}
              onSelect={() => executeItem(item)}
            />
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-moss-light px-4 py-2 text-xs text-ink-soft">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}

function PaletteRow({ item, active, onHover, onSelect }) {
  let Icon = item.icon;
  if (item.type === "directory") Icon = Folder;
  if (item.type === "file") Icon = getFileIcon(item.data.mimeType);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink ${
        active ? "bg-paper-alt" : ""
      }`}
    >
      <Icon size={16} className="shrink-0 text-ink-soft" strokeWidth={1.75} />
      <span className="truncate">{item.label}</span>
      {item.type !== "command" && (
        <span className="ml-auto shrink-0 text-xs text-ink-soft">
          {item.type === "directory" ? "Folder" : "File"}
        </span>
      )}
    </button>
  );
}

export default CommandPalette;
