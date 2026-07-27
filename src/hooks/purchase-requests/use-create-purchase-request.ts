"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { purchaseRequestsApi } from "@/lib/api";
import type { CreatePurchaseRequestInput } from "@/types";

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePurchaseRequestInput) =>
      purchaseRequestsApi.create(input),
    onSuccess: (created) => {
      // Seed the detail cache so navigating straight to the new request does
      // not flash a loading state.
      queryClient.setQueryData(
        queryKeys.purchaseRequests.detail(created.id),
        created,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseRequests.all,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
