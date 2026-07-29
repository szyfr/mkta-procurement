"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import { purchaseRequestsApi } from "@/lib/api";
import type { PurchaseRequestFilters } from "@/types";

export function usePurchaseRequests(filters: PurchaseRequestFilters = {}) {
    return useQuery({
        queryKey: queryKeys.purchaseRequests.list(filters),
        queryFn: ({ signal }) => purchaseRequestsApi.list(filters, signal),
    });
}
