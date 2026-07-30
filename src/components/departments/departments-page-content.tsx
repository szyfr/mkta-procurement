"use client";

import { PlusIcon } from "lucide-react";
import * as React from "react";

import { DepartmentFormDialog } from "@/components/departments/department-form-dialog";
import { DepartmentListView } from "@/components/departments/department-list-view";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { Department } from "@/modules/departments";

/**
 * Owns everything that needs to coordinate between the list and the
 * create/edit dialog: which dialog (if any) is open, and the token that
 * tells the list to refetch after a save.
 */
export function DepartmentsPageContent({ page }: { page: number }) {
  const [dialogState, setDialogState] = React.useState<
    { mode: "create" } | { mode: "edit"; department: Department } | null
  >(null);
  const [reloadToken, setReloadToken] = React.useState(0);

  function handleReload() {
    setReloadToken((token) => token + 1);
  }

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
        reloadToken={reloadToken}
        onEdit={(department) => setDialogState({ mode: "edit", department })}
        onReload={handleReload}
      />

      <DepartmentFormDialog
        open={dialogState !== null}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
        department={
          dialogState?.mode === "edit" ? dialogState.department : null
        }
        onSaved={handleReload}
      />
    </>
  );
}
