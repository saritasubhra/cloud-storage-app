import { Search, X } from "lucide-react";
import { isMac } from "../utils/isMac.js";

function SearchBar({ value, onChange, onOpenPalette }) {
  return (
    <div className="relative w-full max-w-xs">
      <Search
        size={16}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search your files"
        aria-label="Search your files"
        className="w-full rounded-sm border border-moss-light bg-white/60 py-2 pl-9 pr-9 text-sm text-ink outline-none transition-colors focus:border-ochre"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-ink-soft hover:bg-paper-alt hover:text-ink"
        >
          <X size={14} />
        </button>
      ) : (
        onOpenPalette && (
          <button
            type="button"
            onClick={onOpenPalette}
            aria-label="Open command palette"
            title="Open command palette"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm border border-moss-light px-1.5 py-0.5 text-xs text-ink-soft hover:bg-paper-alt"
          >
            {isMac() ? "⌘K" : "Ctrl K"}
          </button>
        )
      )}
    </div>
  );
}

export default SearchBar;
