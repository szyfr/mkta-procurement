"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { referenceApi } from "@/lib/api";

/**
 * Master data for the pickers. It is effectively static within a session, so
 * these never go stale on their own and never refetch behind the user.
 */
const STATIC = { staleTime: Number.POSITIVE_INFINITY } as const;

export function useDepartments() {
    return useQuery({
        queryKey: queryKeys.reference.departments,
        queryFn: ({ signal }) => referenceApi.departments(signal),
        ...STATIC,
    });
}

export function useVendors() {
    return useQuery({
        queryKey: queryKeys.reference.vendors,
        queryFn: ({ signal }) => referenceApi.vendors(signal),
        ...STATIC,
    });
}

export function usePaymentTerms() {
    return useQuery({
        queryKey: queryKeys.reference.paymentTerms,
        queryFn: ({ signal }) => referenceApi.paymentTerms(signal),
        ...STATIC,
    });
}

/** How many catalog rows one scroll of the picker pulls in. */
const CATALOG_PAGE_SIZE = 50;

/**
 * The catalog, a page at a time.
 *
 * It is the one piece of master data too large to treat as a constant — the
 * backend holds ~1,900 materials — so the picker fetches as it scrolls instead
 * of blocking on the whole list. Pages are flattened into a single `items`
 * array, which is what the picker binds to and what makes selecting an item
 * work exactly as it did when the list arrived whole.
 *
 * `search` is answered upstream rather than by filtering what is loaded, so a
 * match on page 30 is reachable without scrolling there. Each term is its own
 * infinite query — and its own cache entry, which is why callers must pass a
 * debounced term rather than raw keystrokes.
 */
export function useCatalogItems(search?: string) {
    const query = useInfiniteQuery({
        queryKey: queryKeys.reference.catalogItems(search),
        queryFn: ({ pageParam, signal }) =>
            referenceApi.catalogItems(
                pageParam,
                CATALOG_PAGE_SIZE,
                search,
                signal,
            ),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.page * lastPage.pageSize < lastPage.total
                ? lastPage.page + 1
                : undefined,
        ...STATIC,
    });

    return {
        ...query,
        items: query.data?.pages.flatMap((page) => page.items) ?? [],
        total: query.data?.pages[0]?.total ?? 0,
    };
}
