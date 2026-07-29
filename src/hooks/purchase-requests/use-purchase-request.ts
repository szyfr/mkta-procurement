"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { ApiClientError, purchaseRequestsApi } from "@/lib/api";

export function usePurchaseRequest(id: string) {
    return useQuery({
        queryKey: queryKeys.purchaseRequests.detail(id),
        queryFn: ({ signal }) => purchaseRequestsApi.get(id, signal),
        enabled: id.length > 0,
    });
}

/** A missing request is a "not found" page, not an error banner. */
export function isNotFound(error: unknown): boolean {
    return error instanceof ApiClientError && error.isNotFound;
}
