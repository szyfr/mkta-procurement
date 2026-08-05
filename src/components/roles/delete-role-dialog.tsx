"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { initials } from "@/data/roles";
import type { Role } from "@/lib/types";

/**
 * Deleting a role has three outcomes, and which one applies is a property of
 * the role rather than a separate flow: it is blocked while anyone still holds
 * it, and permanently blocked for the system roles the product ships with.
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

  const assignedCount = role.assignees.length;
  const blockedByUsers = assignedCount > 0;
  const blockedBySystem = role.isSystem && !blockedByUsers;
  const blocked = blockedByUsers || blockedBySystem;

  function confirm() {
    if (!role) return;
    toast.add({ title: `${role.name} deleted`, type: "success" });
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-0 p-0 data-[size=default]:sm:max-w-[470px]">
        <div className="flex flex-col gap-3 px-5 pt-5 pb-4">
          <AlertDialogHeader className="gap-2">
            <AlertDialogTitle>Delete {role.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {blockedByUsers
                ? `${role.name} is still assigned. Move those users to another role first — deleting a role in use would leave them without access.`
                : blockedBySystem
                  ? `${role.name} is a system role that Procura depends on. It cannot be deleted, but you can deactivate it or edit its permissions.`
                  : "This removes the role and its permission set. Nothing else is affected, and the action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {blocked ? (
            <div className="flex flex-col gap-2 rounded-md border border-status-warning-border bg-status-warning-subtle px-3 py-2.5 text-left">
              <p className="text-[10.5px] font-semibold tracking-[0.06em] text-status-warning-subtle-fg uppercase">
                {blockedByUsers
                  ? `${assignedCount} assigned ${assignedCount === 1 ? "user" : "users"}`
                  : "System role"}
              </p>
              {blockedByUsers ? (
                <ul className="flex flex-wrap gap-1.5">
                  {role.assignees.map((person) => (
                    <li
                      key={person.id}
                      className="inline-flex h-6 items-center gap-1.5 rounded-sm border border-status-warning-border bg-background pr-2 pl-0.5 text-xs"
                    >
                      <span
                        aria-hidden
                        className="flex size-4.5 items-center justify-center rounded-full bg-status-warning-bg text-[9px] font-semibold text-status-warning-fg"
                      >
                        {initials(person.name)}
                      </span>
                      {person.name}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-xs text-status-warning-subtle-fg">
                {blockedByUsers
                  ? "Open Users to reassign them, then delete this role."
                  : "System roles ship with Procura and stay available to every workspace."}
              </p>
            </div>
          ) : null}
        </div>

        <AlertDialogFooter className="mx-0 mb-0 justify-end gap-2 px-5 py-3.5">
          <AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
          {blockedByUsers ? (
            <Button variant="outline">Reassign users</Button>
          ) : null}
          <AlertDialogAction
            variant="destructive"
            disabled={blocked}
            onClick={confirm}
          >
            Delete role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
