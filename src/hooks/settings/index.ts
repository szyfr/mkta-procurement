"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { settingsApi } from "@/lib/api";
import type { UpdateAccountInput } from "@/types";

export function useAccount() {
    return useQuery({
        queryKey: queryKeys.settings.account,
        queryFn: ({ signal }) => settingsApi.account(signal),
    });
}

export function useUsers() {
    return useQuery({
        queryKey: queryKeys.settings.users,
        queryFn: ({ signal }) => settingsApi.users(signal),
    });
}

export function useRolePermissions() {
    return useQuery({
        queryKey: queryKeys.settings.roles,
        queryFn: ({ signal }) => settingsApi.roles(signal),
        staleTime: Number.POSITIVE_INFINITY,
    });
}

export function useUpdateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateAccountInput) =>
            settingsApi.updateAccount(input),
        onSuccess: (account) => {
            queryClient.setQueryData(queryKeys.settings.account, account);
            // The sidebar footer shows the same person.
            queryClient.invalidateQueries({ queryKey: queryKeys.session });
            queryClient.invalidateQueries({
                queryKey: queryKeys.settings.users,
            });
        },
    });
}
