"use client";

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type * as React from "react";

/**
 * TanStack Query wiring for the whole app.
 *
 * The client is deliberately not a module-level singleton: on the server that
 * would share one cache across every request (and every user), so a fresh one
 * is built per render there and reused only in the browser.
 */

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Purchasing data is operational, so nothing is cached for long — but
        // a short window keeps paging back and forth from refetching on every
        // click.
        staleTime: 30_000,
        // The BFF already normalizes upstream failures into user-safe
        // messages; one retry covers a blip without leaving the error state
        // hidden behind seconds of backoff.
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();

  browserQueryClient ??= makeQueryClient();

  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Not useState(makeQueryClient) — Suspense could throw away the first client
  // before it is ever used; getQueryClient owns the browser singleton instead.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
