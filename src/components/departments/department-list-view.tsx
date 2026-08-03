"use client";

import { useQuery } from "@tanstack/react-query";
import { BuildingIcon } from "lucide-react";

import { DepartmentTable } from "@/components/departments/department-table";
import { EmptyState, ErrorAlert } from "@/components/shared/query-states";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { buildPageHref } from "@/lib/page-href";
import { type Department, departmentListQuery } from "@/modules/departments";

/** Department list, fetched from the BFF in the browser via TanStack Query. */
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

  if (isError) {
    return <ErrorAlert title="Couldn't load departments" error={error} />;
  }

  if (isPending) {
    return <TableSkeleton />;
  }

  const { departments, page: pageInfo } = data;

  if (departments.length === 0) {
    return (
      <EmptyState
        icon={<BuildingIcon />}
        title="No departments yet"
        description="Create one to start assigning purchase requests to a department."
      />
    );
  }

  return (
    <DepartmentTable
      departments={departments}
      page={pageInfo}
      buildPageHref={(next) => buildPageHref("/departments", next)}
      onEdit={onEdit}
    />
  );
}
