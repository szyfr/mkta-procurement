"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { canvassingApi } from "@/lib/api";
import type { CreateBatchInput, CreateQuoteInput } from "@/types";

/**
 * All three canvassing writes touch the same slice of the cache: the detail for
 * this request, the case list, the request itself and the dashboard. They share
 * one invalidation helper so none of them can quietly forget one.
 */
function useCanvassingInvalidation(purchaseRequestId: string) {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({
            queryKey: queryKeys.canvassing.detail(purchaseRequestId),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.canvassing.all });
        queryClient.invalidateQueries({
            queryKey: queryKeys.purchaseRequests.detail(purchaseRequestId),
        });
        queryClient.invalidateQueries({
            queryKey: queryKeys.purchaseRequests.all,
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };
}

export function useCreateBatch(purchaseRequestId: string) {
    const invalidate = useCanvassingInvalidation(purchaseRequestId);

    return useMutation({
        mutationFn: (input: CreateBatchInput) =>
            canvassingApi.createBatch(purchaseRequestId, input),
        onSuccess: invalidate,
    });
}

export function useCreateQuote(purchaseRequestId: string) {
    const invalidate = useCanvassingInvalidation(purchaseRequestId);

    return useMutation({
        mutationFn: ({
            batch,
            ...input
        }: CreateQuoteInput & { batch: number }) =>
            canvassingApi.addQuote(purchaseRequestId, batch, input),
        onSuccess: invalidate,
    });
}

export function useSelectVendor(purchaseRequestId: string) {
    const queryClient = useQueryClient();
    const invalidate = useCanvassingInvalidation(purchaseRequestId);

    return useMutation({
        mutationFn: ({ batch, quoteId }: { batch: number; quoteId: string }) =>
            canvassingApi.selectVendor(purchaseRequestId, batch, { quoteId }),
        onSuccess: (detail) => {
            // The endpoint returns the refreshed detail, so the panel can collapse to
            // the winner card immediately rather than after a round trip.
            queryClient.setQueryData(
                queryKeys.canvassing.detail(purchaseRequestId),
                detail,
            );
            invalidate();
        },
    });
}
