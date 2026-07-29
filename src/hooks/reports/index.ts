"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { reportsApi } from "@/lib/api";
import type { ReportFilters } from "@/types";

export function useReports() {
    return useQuery({
        queryKey: queryKeys.reports.list,
        queryFn: ({ signal }) => reportsApi.list(signal),
        // The picker's titles and descriptions do not change during a session.
        staleTime: Number.POSITIVE_INFINITY,
    });
}

/**
 * Generating a report is a query, not a mutation — it reads. `enabled` is what
 * makes it fire only once a report has been chosen, which replaces the
 * hand-rolled `setTimeout` the workspace used to fake loading with.
 */
export function useReport(id: string | null, filters: ReportFilters = {}) {
    return useQuery({
        queryKey: queryKeys.reports.detail(id ?? "", filters),
        queryFn: ({ signal }) => reportsApi.get(id as string, filters, signal),
        enabled: Boolean(id),
    });
}
