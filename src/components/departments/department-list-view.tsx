"use client";

import { useQuery } from "@tanstack/react-query";
import { BuildingIcon } from "lucide-react";

import { DepartmentTable } from "@/components/departments/department-table";
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
import { type Department, departmentListQuery } from "@/modules/departments";

/** Department list, fetched from the BFF in the browser via TanStack Query. */

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

export function DepartmentListView({
  page,
  onEdit,
}: {
  page: number;
  onEdit: (department: Department) => void;
}) {
  // Create, edit and delete invalidate the department cache, so the list
  // refetches itself — no reload token has to be threaded down from the page.
  const { data, isPending, isError, error } = useQuery(
    departmentListQuery(page),
  );

  function buildPageHref(next: number) {
    const params = new URLSearchParams();
    if (next > 1) params.set("page", String(next));

    const query = params.toString();
    return query ? `/departments?${query}` : "/departments";
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn&apos;t load departments</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Something went wrong."}
        </AlertDescription>
      </Alert>
    );
  }

  if (isPending) {
    return <ListSkeleton />;
  }

  const { departments, page: pageInfo } = data;

  if (departments.length === 0) {
    return (
      <Card>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BuildingIcon />
              </EmptyMedia>
              <EmptyTitle>No departments yet</EmptyTitle>
              <EmptyDescription>
                Create one to start assigning purchase requests to a department.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <DepartmentTable
      departments={departments}
      page={pageInfo}
      buildPageHref={buildPageHref}
      onEdit={onEdit}
    />
  );
}
