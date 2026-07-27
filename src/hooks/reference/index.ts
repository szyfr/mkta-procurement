"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { referenceApi } from "@/lib/api";

/**
 * Master data for the pickers. It is effectively static within a session, so
 * these never go stale on their own and never refetch behind the user.
 */
const STATIC = { staleTime: Number.POSITIVE_INFINITY } as const;

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.reference.departments,
    queryFn: ({ signal }) => referenceApi.departments(signal),
    ...STATIC,
  });
}

export function useVendors() {
  return useQuery({
    queryKey: queryKeys.reference.vendors,
    queryFn: ({ signal }) => referenceApi.vendors(signal),
    ...STATIC,
  });
}

export function usePaymentTerms() {
  return useQuery({
    queryKey: queryKeys.reference.paymentTerms,
    queryFn: ({ signal }) => referenceApi.paymentTerms(signal),
    ...STATIC,
  });
}

export function useCatalogItems() {
  return useQuery({
    queryKey: queryKeys.reference.catalogItems,
    queryFn: ({ signal }) => referenceApi.catalogItems(signal),
    ...STATIC,
  });
}
