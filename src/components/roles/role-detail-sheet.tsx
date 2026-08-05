"use client";

import { CopyIcon, PencilIcon, Trash2Icon } from "lucide-react";

import {
  GrantChip,
  RoleStatusBadge,
  SectionLabel,
} from "@/components/roles/role-primitives";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  grantedModuleCount,
  initials,
  moduleGrantCount,
  permissionModules,
  totalPermissionCount,
} from "@/data/roles";
import type { Role } from "@/lib/types";

/** Label above value, the shape both the role and audit grids use. */
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

/** Read-only summary of one role, opened by clicking its row. */
export function RoleDetailSheet({
  role,
  open,
  onOpenChange,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onDelete: (role: Role) => void;
}) {
  if (!role) return null;

  const granted = role.permissions.length;
  const moduleCount = grantedModuleCount(role.permissions);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* The side-scoped widths have to be overridden on the same selector, or
          the base `data-[side=right]:w-3/4` outranks a plain `w-` utility. */}
      <SheetContent className="flex flex-col gap-0 p-0 data-[side=right]:w-[470px] data-[side=right]:sm:max-w-[470px]">
        <SheetHeader className="gap-1 border-b p-4 pr-24">
          <SheetDescription className="font-mono text-xs">
            {role.key}
          </SheetDescription>
          <SheetTitle>{role.name}</SheetTitle>
          <div className="absolute top-4 right-12">
            <RoleStatusBadge status={role.status} />
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
          <section className="flex flex-col gap-3">
            <SectionLabel>Role information</SectionLabel>
            <p className="leading-relaxed text-muted-foreground">
              {role.description}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Role type"
                value={role.isSystem ? "System role" : "Custom role"}
              />
              <Field
                label="Assigned users"
                value={
                  role.assignees.length === 0
                    ? "Unassigned"
                    : `${role.assignees.length} ${role.assignees.length === 1 ? "user" : "users"}`
                }
              />
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <SectionLabel>Assigned users</SectionLabel>
              <span className="text-xs text-muted-foreground tabular-nums">
                {role.assignees.length}
              </span>
            </div>
            {role.assignees.length === 0 ? (
              <p className="text-muted-foreground">
                No users are assigned to this role yet.
              </p>
            ) : (
              <ul>
                {role.assignees.map((person) => (
                  <li
                    key={person.id}
                    className="flex items-center gap-2.5 border-b py-2 last:border-0"
                  >
                    <Avatar>
                      <AvatarFallback className="text-xs font-semibold">
                        {initials(person.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{person.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {person.department}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-2.5">
            <SectionLabel>Permission summary</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border px-2.5 py-2">
                <p className="text-xs text-muted-foreground">Granted</p>
                <p className="text-base font-semibold tabular-nums">
                  {granted}
                </p>
              </div>
              <div className="rounded-lg border px-2.5 py-2">
                <p className="text-xs text-muted-foreground">Of total</p>
                <p className="text-base font-semibold tabular-nums">
                  {totalPermissionCount}
                </p>
              </div>
              <div className="rounded-lg border px-2.5 py-2">
                <p className="text-xs text-muted-foreground">Modules</p>
                <p className="text-base font-semibold tabular-nums">
                  {moduleCount} / {permissionModules.length}
                </p>
              </div>
            </div>
            <Progress
              value={(granted / totalPermissionCount) * 100}
              aria-label={`${granted} of ${totalPermissionCount} permissions granted`}
              className="gap-0 [&_[data-slot=progress-track]]:h-2"
            />
          </section>

          <section className="flex flex-col gap-2">
            <SectionLabel>Permission groups</SectionLabel>
            <ul className="flex flex-col gap-1.5">
              {permissionModules.map((module) => {
                const moduleGranted = moduleGrantCount(
                  role.permissions,
                  module.key,
                );
                const total = module.permissions.length;

                return (
                  <li key={module.key} className="flex items-center gap-3">
                    <span
                      className={
                        moduleGranted === 0
                          ? "flex-1 text-muted-foreground"
                          : "flex-1"
                      }
                    >
                      {module.name}
                    </span>
                    <Progress
                      value={(moduleGranted / total) * 100}
                      aria-label={`${module.name}: ${moduleGranted} of ${total} granted`}
                      className="w-24 gap-0"
                    />
                    <GrantChip
                      granted={moduleGranted}
                      total={total}
                      highlight={moduleGranted === total}
                    />
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <SectionLabel>Audit information</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Created" value={role.createdAt} />
              <Field label="Created by" value={role.createdBy} />
              <Field label="Last updated" value={role.updatedAt} />
              <Field label="Updated by" value={role.updatedBy} />
            </div>
          </section>
        </div>

        <div className="flex items-center gap-2 border-t p-4">
          <Button className="flex-1" onClick={() => onEdit(role)}>
            <PencilIcon data-icon="inline-start" />
            Edit role
          </Button>
          <Button variant="outline" onClick={() => onDuplicate(role)}>
            <CopyIcon data-icon="inline-start" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Delete ${role.name}`}
            className="border-status-danger-border bg-background text-destructive hover:bg-status-danger-subtle hover:text-destructive"
            onClick={() => onDelete(role)}
          >
            <Trash2Icon />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
