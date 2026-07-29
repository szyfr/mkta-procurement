"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ApiClientError } from "@/lib/api";

/**
 * The QueryClient is created inside `useState` rather than at module scope.
 *
 * A module-level client would be shared by every request the server renders,
 * leaking one user's cached data into another's response.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        refetchOnWindowFocus: false,
                        // Retrying a 404 or a validation failure only delays the error the
                        // user needs to see; only infrastructure failures are worth another
                        // attempt.
                        retry: (failureCount, error) => {
                            if (
                                error instanceof ApiClientError &&
                                error.status < 500
                            ) {
                                return false;
                            }
                            return failureCount < 2;
                        },
                    },
                    mutations: { retry: false },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
