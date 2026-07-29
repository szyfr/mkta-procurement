"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { searchApi } from "@/lib/api";

/**
 * Debounced so typing does not fire a request per keystroke, and
 * `keepPreviousData` so the dropdown keeps showing the last results while the
 * next ones load instead of collapsing to empty between keystrokes.
 */
export function useSearch(query: string) {
    const debounced = useDebouncedValue(query.trim());

    const result = useQuery({
        queryKey: queryKeys.search(debounced),
        queryFn: ({ signal }) => searchApi.search(debounced, signal),
        enabled: debounced.length > 0,
        placeholderData: keepPreviousData,
        staleTime: 60_000,
    });

    return { ...result, debouncedQuery: debounced };
}
