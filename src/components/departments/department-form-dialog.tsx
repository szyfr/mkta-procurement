"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import { DepartmentForm } from "@/components/departments/department-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import {
  createDepartment,
  type Department,
  type DepartmentPayload,
  departmentKeys,
  updateDepartment,
} from "@/modules/departments";

/**
 * Create/edit dialog. A single instance handles both modes — passing
 * `department` switches it to edit, pre-filled from the row already loaded
 * by the list (no extra fetch needed).
 */
export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
}) {
  const isEdit = Boolean(department);
  const queryClient = useQueryClient();

  const {
    mutate: save,
    isPending: submitting,
    error,
    reset,
  } = useMutation({
    mutationFn: (values: DepartmentPayload) =>
      isEdit && department
        ? updateDepartment(department.id, values)
        : createDepartment(values),
    onSuccess: (_saved, values) => {
      toast.add({
        title: isEdit ? "Department updated" : "Department created",
        description: isEdit
          ? `"${values.title}" was saved.`
          : `"${values.title}" was added.`,
        type: "success",
      });

      onOpenChange(false);
      // The list refetches off this rather than a reload token from the page.
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });

  // Clear stale request state each time the dialog is opened.
  React.useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Department" : "New Department"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this department's details."
              : "Add a department purchase requests can be assigned to."}
          </DialogDescription>
        </DialogHeader>

        <DepartmentForm
          key={department?.id ?? "create"}
          initialValues={
            department
              ? { title: department.title, description: department.description }
              : undefined
          }
          submitLabel={isEdit ? "Save Changes" : "Create Department"}
          submitting={submitting}
          error={
            error
              ? error instanceof Error
                ? error.message
                : "Something went wrong."
              : null
          }
          onSubmit={save}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
