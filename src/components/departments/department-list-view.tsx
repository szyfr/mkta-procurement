"use client";

import { BuildingIcon } from "lucide-react";
import * as React from "react";

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
import {
  type Department,
  fetchDepartments,
  type PageInfo,
} from "@/modules/departments";

/** Department list, fetched from the BFF in the browser. */

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
  reloadToken,
  onEdit,
  onReload,
}: {
  page: number;
  /** Bumped by the parent to retrigger this fetch after a create/edit/delete. */
  reloadToken: number;
  onEdit: (department: Department) => void;
  onReload: () => void;
}) {
  const [departments, setDepartments] = React.useState<Department[] | null>(
    null,
  );
  const [pageInfo, setPageInfo] = React.useState<PageInfo | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadToken exists only to retrigger this fetch after a create/edit/delete
  React.useEffect(() => {
    const controller = new AbortController();

    setDepartments(null);
    setError(null);

    fetchDepartments({ page, signal: controller.signal })
      .then((result) => {
        setDepartments(result.departments);
        setPageInfo(result.page);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error ? cause.message : "Something went wrong.",
        );
      });

    return () => controller.abort();
  }, [page, reloadToken]);

  function buildPageHref(next: number) {
    const params = new URLSearchParams();
    if (next > 1) params.set("page", String(next));

    const query = params.toString();
    return query ? `/departments?${query}` : "/departments";
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn&apos;t load departments</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (departments === null) {
    return <ListSkeleton />;
  }

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
      page={pageInfo as PageInfo}
      buildPageHref={buildPageHref}
      onEdit={onEdit}
      onDeleted={onReload}
    />
  );
}
