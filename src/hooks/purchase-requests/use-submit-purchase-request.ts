"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { purchaseRequestsApi } from "@/lib/api";

/**
 * Submitting can create purchase orders and route items to canvassing, so the
 * canvassing and dashboard caches are invalidated alongside the request itself.
 */
export function useSubmitPurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseRequestsApi.submit(id),
    onSuccess: (submitted) => {
      queryClient.setQueryData(
        queryKeys.purchaseRequests.detail(submitted.id),
        submitted,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseRequests.all,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.canvassing.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
