"use client";

import { useQuery } from "@tanstack/react-query";
import { TruckIcon } from "lucide-react";

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
import { VendorTable } from "@/components/vendors/vendor-table";
import { vendorListQuery } from "@/modules/vendors";

/** Vendor list, fetched from the BFF in the browser via TanStack Query. */

function ListSkeleton() {
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

export function VendorListView({ page }: { page: number }) {
  const { data, isPending, isError, error } = useQuery(vendorListQuery(page));

  function buildPageHref(next: number) {
    const params = new URLSearchParams();
    if (next > 1) params.set("page", String(next));

    const query = params.toString();
    return query ? `/vendors?${query}` : "/vendors";
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn&apos;t load vendors</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Something went wrong."}
        </AlertDescription>
      </Alert>
    );
  }

  if (isPending) {
    return <ListSkeleton />;
  }

  const { vendors, page: pageInfo } = data;

  if (vendors.length === 0) {
    return (
      <Card>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TruckIcon />
              </EmptyMedia>
              <EmptyTitle>No vendors yet</EmptyTitle>
              <EmptyDescription>
                Vendors are synced from the ERP. Once they arrive they&apos;ll
                be listed here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <VendorTable
      vendors={vendors}
      page={pageInfo}
      buildPageHref={buildPageHref}
    />
  );
}
