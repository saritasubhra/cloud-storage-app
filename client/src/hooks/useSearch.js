import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { searchRequest } from "../api/searchApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const DEBOUNCE_MS = 350;

export function useSearch(query) {
  const [results, setResults] = useState({ directories: [], files: [] });
  const [loading, setLoading] = useState(false);
  // Bumping this forces the effect below to re-run without needing the
  // query itself to change - used to refresh results after an action
  // (rename/move/delete) performed on a search result.
  const [refreshTick, setRefreshTick] = useState(0);

  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) {
      setResults({ directories: [], files: [] });
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const runSearch = async () => {
      try {
        const res = await searchRequest(trimmed);
        if (!cancelled) setResults(res.data.data);
      } catch (error) {
        if (!cancelled) toast.error(getErrorMessage(error, "Search failed."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timeoutId = setTimeout(runSearch, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, refreshTick]);

  const refresh = useCallback(() => setRefreshTick((t) => t + 1), []);

  return { results, loading, isSearching: !!trimmed, refresh };
}
