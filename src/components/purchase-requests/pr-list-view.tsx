"use client";

import { useQuery } from "@tanstack/react-query";
import { InboxIcon } from "lucide-react";
import * as React from "react";

import { PurchaseRequestCard } from "@/components/purchase-requests/pr-card";
import { StatusLegend } from "@/components/purchase-requests/pr-status-legend";
import { PurchaseRequestTable } from "@/components/purchase-requests/pr-table";
import type { ListView } from "@/components/purchase-requests/view-toggle";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { EmptyState, ErrorAlert } from "@/components/shared/query-states";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { buildPageHref } from "@/lib/page-href";
import {
  departmentOptionsQuery,
  purchaseRequestListQuery,
} from "@/modules/purchase-requests";

/**
 * Purchase request list, fetched from the BFF in the browser via TanStack
 * Query.
 *
 * The toolbar filters are presentational — filtering is not part of this
 * integration — but the Department options come from the real lookup endpoint
 * rather than a hardcoded list.
 */

const staticFilters = [
  {
    label: "Status",
    options: [
      "Draft",
      "Canvassing",
      "PO Created",
      "Partially Completed",
      "Completed",
      "Rejected",
    ],
  },
  { label: "Priority", options: ["High", "Normal", "Low"] },
];

const dateFilter = {
  label: "Date",
  options: ["Last 7 days", "Last 30 days", "Last 90 days"],
};

function CardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder cards
        <Skeleton key={index} className="h-44 w-full" />
      ))}
    </div>
  );
}

/** The table only ever renders in table view, so its links keep that view. */
function tablePageHref(page: number) {
  return buildPageHref(
    "/purchase-requests",
    page,
    new URLSearchParams({ view: "table" }),
  );
}

export function PurchaseRequestListView({
  view,
  page,
}: {
  view: ListView;
  page: number;
}) {
  const { data, isPending, isError, error } = useQuery(
    purchaseRequestListQuery(page),
  );

  // Department options only shape a presentational filter, so this query's
  // failure is deliberately swallowed — it must not take the list down with
  // it, and an empty option list is the same fallback as before.
  const departmentOptions = useQuery(departmentOptionsQuery());

  const filters = React.useMemo(
    () => [
      ...staticFilters,
      {
        label: "Department",
        options:
          departmentOptions.data?.options.map((option) => option.label) ?? [],
      },
      dateFilter,
    ],
    [departmentOptions.data],
  );

  return (
    <>
      <DataToolbar placeholder="Filter requests…" filters={filters} />

      <StatusLegend />

      {isError ? (
        <ErrorAlert title="Couldn't load purchase requests" error={error} />
      ) : isPending ? (
        view === "table" ? (
          <TableSkeleton columns={9} />
        ) : (
          <CardsSkeleton />
        )
      ) : data.requests.length === 0 ? (
        <EmptyState
          icon={<InboxIcon />}
          title="No purchase requests yet"
          description="Create one to start tracking a purchase from draft through delivery."
        />
      ) : view === "table" ? (
        <PurchaseRequestTable
          requests={data.requests}
          page={data.page}
          buildPageHref={tablePageHref}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.requests.map((request) => (
            <PurchaseRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </>
  );
}
