"use client";

import { TrashIcon } from "lucide-react";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { deleteDepartment } from "@/modules/departments";

export function DeleteDepartmentDialog({
  department,
  onDeleted,
}: {
  department: { id: string; title: string };
  onDeleted: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    setDeleting(true);

    try {
      await deleteDepartment(department.id);

      toast.add({
        title: "Department deleted",
        description: `"${department.title}" was removed.`,
        type: "success",
      });
      setOpen(false);
      onDeleted(department.id);
    } catch (cause) {
      toast.add({
        title: "Couldn't delete department",
        description:
          cause instanceof Error ? cause.message : "Something went wrong.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${department.title}`}
          />
        }
      >
        <TrashIcon />
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete department?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &ldquo;{department.title}&rdquo;. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Spinner data-icon="inline-start" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
