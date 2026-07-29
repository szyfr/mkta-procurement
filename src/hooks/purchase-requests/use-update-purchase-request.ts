"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { purchaseRequestsApi } from "@/lib/api";
import type { UpdatePurchaseRequestInput } from "@/types";

export function useUpdatePurchaseRequest(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdatePurchaseRequestInput) =>
            purchaseRequestsApi.update(id, input),
        onSuccess: (updated) => {
            queryClient.setQueryData(
                queryKeys.purchaseRequests.detail(id),
                updated,
            );
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchaseRequests.all,
            });
        },
    });
}
