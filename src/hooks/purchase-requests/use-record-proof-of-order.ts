"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { purchaseRequestsApi } from "@/lib/api";
import type { ProofOfOrderInput } from "@/types";

export function useRecordProofOfOrder(purchaseRequestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      ...input
    }: ProofOfOrderInput & { itemId: string }) =>
      purchaseRequestsApi.recordProofOfOrder(purchaseRequestId, itemId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        queryKeys.purchaseRequests.detail(purchaseRequestId),
        updated,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseRequests.all,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
