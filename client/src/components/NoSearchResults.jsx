import { SearchX } from "lucide-react";

function NoSearchResults({ query }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <SearchX className="text-moss" size={32} strokeWidth={1.5} />
      <div>
        <p className="font-medium text-ink">No results for "{query}"</p>
        <p className="mt-1 text-sm text-ink-soft">Try a different name or check your spelling.</p>
      </div>
    </div>
  );
}

export default NoSearchResults;
