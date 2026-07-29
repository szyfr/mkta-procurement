"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { dashboardApi } from "@/lib/api";

export function useDashboard() {
    return useQuery({
        queryKey: queryKeys.dashboard,
        queryFn: ({ signal }) => dashboardApi.get(signal),
    });
}
