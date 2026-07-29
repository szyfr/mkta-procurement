"use client";

import { RefreshCwIcon } from "lucide-react";
import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Catches render-time failures inside the dashboard shell. Query failures are
 * handled inline by each view; this is the backstop for everything else.
 */
export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[dashboard] render error", error);
    }, [error]);

    return (
        <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
                <span>
                    This page could not be displayed.
                    {error.digest ? ` Reference: ${error.digest}` : ""}
                </span>
                <Button variant="outline" size="sm" onClick={reset}>
                    <RefreshCwIcon data-icon="inline-start" />
                    Try again
                </Button>
            </AlertDescription>
        </Alert>
    );
}
