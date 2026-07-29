"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { sessionApi } from "@/lib/api";

/**
 * The signed-in user. React never sees the session cookie itself — it asks the
 * BFF who it is talking to, which is the same call that will work unchanged
 * once FastAPI issues the cookie.
 */
export function useSession() {
    return useQuery({
        queryKey: queryKeys.session,
        queryFn: ({ signal }) => sessionApi.get(signal),
        staleTime: 5 * 60_000,
    });
}

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            email,
            password,
        }: {
            email: string;
            password: string;
        }) => sessionApi.login(email, password),
        onSuccess: (user) => {
            queryClient.setQueryData(queryKeys.session, user);
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => sessionApi.logout(),
        // Everything cached belonged to the previous session.
        onSuccess: () => queryClient.clear(),
    });
}
