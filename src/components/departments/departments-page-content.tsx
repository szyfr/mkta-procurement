"use client";

import { PlusIcon } from "lucide-react";
import * as React from "react";

import { DepartmentFormDialog } from "@/components/departments/department-form-dialog";
import { DepartmentListView } from "@/components/departments/department-list-view";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { Department } from "@/modules/departments";

/**
 * Owns the one thing the list and the create/edit dialog have to agree on:
 * which dialog, if any, is open. Refetching after a save is handled by the
 * mutations invalidating the department cache.
 */
export function DepartmentsPageContent({ page }: { page: number }) {
  const [dialogState, setDialogState] = React.useState<
    { mode: "create" } | { mode: "edit"; department: Department } | null
  >(null);

  return (
    <>
      <PageHeader
        title="Departments"
        description="Manage the departments purchase requests are assigned to"
        actions={
          <Button
            variant="outline"
            onClick={() => setDialogState({ mode: "create" })}
          >
            <PlusIcon data-icon="inline-start" />
            New Department
          </Button>
        }
      />

      <DepartmentListView
        page={page}
        onEdit={(department) => setDialogState({ mode: "edit", department })}
      />

      <DepartmentFormDialog
        open={dialogState !== null}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
        department={
          dialogState?.mode === "edit" ? dialogState.department : null
        }
      />
    </>
  );
}
