"use client";

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
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  onSaved: (department: Department) => void;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isEdit = Boolean(department);

  // Clear stale request state each time the dialog is opened.
  React.useEffect(() => {
    if (open) {
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  async function handleSubmit(values: DepartmentPayload) {
    setError(null);
    setSubmitting(true);

    try {
      const saved =
        isEdit && department
          ? await updateDepartment(department.id, values)
          : await createDepartment(values);

      toast.add({
        title: isEdit ? "Department updated" : "Department created",
        description: isEdit
          ? `"${values.title}" was saved.`
          : `"${values.title}" was added.`,
        type: "success",
      });

      onOpenChange(false);
      onSaved(saved);
      setSubmitting(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Something went wrong.",
      );
      setSubmitting(false);
    }
  }

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
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
