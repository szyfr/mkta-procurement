"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { type CanvassingListFilters, canvassingApi } from "@/lib/api";

export function useCanvassingCases(filters: CanvassingListFilters = {}) {
    return useQuery({
        queryKey: queryKeys.canvassing.list(filters),
        queryFn: ({ signal }) => canvassingApi.list(filters, signal),
    });
}

export function useCanvassingDetail(purchaseRequestId: string) {
    return useQuery({
        queryKey: queryKeys.canvassing.detail(purchaseRequestId),
        queryFn: ({ signal }) => canvassingApi.get(purchaseRequestId, signal),
        enabled: purchaseRequestId.length > 0,
    });
}
