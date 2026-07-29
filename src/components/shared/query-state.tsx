"use client";

import { RefreshCwIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiClientError } from "@/lib/api";

/**
 * Shared loading and error surfaces for query-backed views, following the
 * pattern the report workspace already established: skeletons inside an
 * `aria-live` region while pending, a destructive alert on failure.
 */

export function DataError({
    error,
    onRetry,
    title = "Something went wrong",
}: {
    error: unknown;
    onRetry?: () => void;
    title?: string;
}) {
    const message =
        error instanceof ApiClientError
            ? error.message
            : "The data could not be loaded.";

    return (
        <Alert variant="destructive">
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
                <span>{message}</span>
                {onRetry ? (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                        <RefreshCwIcon data-icon="inline-start" />
                        Try again
                    </Button>
                ) : null}
            </AlertDescription>
        </Alert>
    );
}

export function TableSkeleton({
    rows = 5,
    columns = 5,
}: {
    rows?: number;
    columns?: number;
}) {
    return (
        <div
            aria-live="polite"
            aria-busy="true"
            className="flex flex-col gap-3 p-4"
        >
            <span className="sr-only">Loading…</span>
            {Array.from({ length: rows }, (_, rowIndex) => (
                <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list, never reordered
                    key={`row-${rowIndex}`}
                    className="grid gap-4"
                    style={{
                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                >
                    {Array.from({ length: columns }, (_, columnIndex) => (
                        <Skeleton
                            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list, never reordered
                            key={`cell-${rowIndex}-${columnIndex}`}
                            className="h-4"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function CardsSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div
            aria-live="polite"
            aria-busy="true"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
            <span className="sr-only">Loading…</span>
            {Array.from({ length: count }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list, never reordered
                <Card key={`card-${index}`}>
                    <CardHeader className="gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-40" />
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function PanelSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div
            aria-live="polite"
            aria-busy="true"
            className="flex flex-col gap-3 p-4"
        >
            <span className="sr-only">Loading…</span>
            {Array.from({ length: lines }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list, never reordered
                <Skeleton key={`line-${index}`} className="h-3 w-full" />
            ))}
        </div>
    );
}
