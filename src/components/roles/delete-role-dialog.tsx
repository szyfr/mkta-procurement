"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Role } from "@/modules/roles";

/**
 * FastAPI has no delete endpoint for roles yet, so this stays a dead end: the
 * dialog still opens from the row menu and the sheet, but the destructive
 * action is disabled rather than removed.
 */
export function DeleteRoleDialog({
  role,
  open,
  onOpenChange,
}: {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!role) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-0 p-0 data-[size=default]:sm:max-w-[470px]">
        <div className="flex flex-col gap-3 px-5 pt-5 pb-4">
          <AlertDialogHeader className="gap-2">
            <AlertDialogTitle>Delete {role.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting a role isn&rsquo;t available yet — the backend
              doesn&rsquo;t expose a delete endpoint for roles.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="mx-0 mb-0 justify-end gap-2 px-5 py-3.5">
          <AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled>
            Delete role
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
