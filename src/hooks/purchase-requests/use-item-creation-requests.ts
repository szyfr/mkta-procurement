"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { itemCreationRequestsApi } from "@/lib/api";
import type { CreateItemCreationRequestInput } from "@/types";

export function useItemCreationRequests() {
    return useQuery({
        queryKey: queryKeys.itemCreationRequests,
        queryFn: ({ signal }) => itemCreationRequestsApi.list(signal),
    });
}

export function useCreateItemCreationRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateItemCreationRequestInput) =>
            itemCreationRequestsApi.create(input),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.itemCreationRequests,
            });
        },
    });
}
