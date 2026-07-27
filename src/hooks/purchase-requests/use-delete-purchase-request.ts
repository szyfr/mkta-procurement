"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { purchaseRequestsApi } from "@/lib/api";

export function useDeletePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseRequestsApi.remove(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({
        queryKey: queryKeys.purchaseRequests.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseRequests.all,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
