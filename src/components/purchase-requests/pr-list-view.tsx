"use client";

import { useQuery } from "@tanstack/react-query";
import { InboxIcon } from "lucide-react";
import * as React from "react";

import { PurchaseRequestCard } from "@/components/purchase-requests/pr-card";
import { PurchaseRequestTable } from "@/components/purchase-requests/pr-table";
import type { ListView } from "@/components/purchase-requests/view-toggle";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { StatusLegend } from "@/components/shared/status-legend";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
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

function ListSkeleton({ view }: { view: ListView }) {
  if (view === "table") {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder rows
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder cards
        <Skeleton key={index} className="h-44 w-full" />
      ))}
    </div>
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

  const departments = React.useMemo(
    () => departmentOptions.data?.options.map((it) => it.label) ?? [],
    [departmentOptions.data],
  );

  const filters = React.useMemo(
    () => [
      ...staticFilters,
      { label: "Department", options: departments },
      dateFilter,
    ],
    [departments],
  );

  function buildPageHref(next: number) {
    const params = new URLSearchParams();
    if (view === "table") params.set("view", "table");
    if (next > 1) params.set("page", String(next));

    const query = params.toString();
    return query ? `/purchase-requests?${query}` : "/purchase-requests";
  }

  return (
    <>
      <DataToolbar placeholder="Filter requests…" filters={filters} />

      <StatusLegend />

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load purchase requests</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Something went wrong."}
          </AlertDescription>
        </Alert>
      ) : isPending ? (
        <ListSkeleton view={view} />
      ) : data.requests.length === 0 ? (
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>No purchase requests yet</EmptyTitle>
                <EmptyDescription>
                  Create one to start tracking a purchase from draft through
                  delivery.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : view === "table" ? (
        <PurchaseRequestTable
          requests={data.requests}
          page={data.page}
          buildPageHref={buildPageHref}
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
