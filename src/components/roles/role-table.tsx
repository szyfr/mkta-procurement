"use client";

import {
  CopyIcon,
  EyeIcon,
  MoreVerticalIcon,
  PencilIcon,
  ShieldIcon,
  Trash2Icon,
} from "lucide-react";

import {
  AssigneeStack,
  RoleStatusBadge,
} from "@/components/roles/role-primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { totalPermissionCount } from "@/data/roles";
import type { Role } from "@/lib/types";

/**
 * The roles list. The whole row opens the read-only sheet; the actions menu
 * stops the click from reaching it so a menu item never opens both.
 */
export function RoleTable({
  roles,
  openRoleId,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  roles: Role[];
  /** Row left tinted while its sheet is open. */
  openRoleId?: string | null;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onDelete: (role: Role) => void;
}) {
  return (
    <Card>
      <CardContent className="px-0">
        <Table className="min-w-[1080px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                scope="col"
                className="h-auto w-[24%] px-3 py-2.5 text-xs text-muted-foreground"
              >
                Role
              </TableHead>
              <TableHead
                scope="col"
                className="h-auto w-[28%] px-3 py-2.5 text-xs text-muted-foreground"
              >
                Description
              </TableHead>
              <TableHead
                scope="col"
                className="h-auto w-[150px] px-3 py-2.5 text-xs text-muted-foreground"
              >
                Assigned users
              </TableHead>
              <TableHead
                scope="col"
                className="h-auto w-[170px] px-3 py-2.5 text-xs text-muted-foreground"
              >
                Permissions
              </TableHead>
              <TableHead
                scope="col"
                className="h-auto w-[110px] px-3 py-2.5 text-xs text-muted-foreground"
              >
                Status
              </TableHead>
              <TableHead
                scope="col"
                className="h-auto w-[150px] px-3 py-2.5 text-xs text-muted-foreground"
              >
                Last updated
              </TableHead>
              <TableHead scope="col" className="h-auto w-[56px] px-3 py-2.5">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => {
              const granted = role.permissions.length;

              return (
                <TableRow
                  key={role.id}
                  className="cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  aria-selected={openRoleId === role.id}
                  onClick={() => onView(role)}
                >
                  <TableCell className="p-3 align-middle">
                    <div className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-0.5 flex size-6.5 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                      >
                        <ShieldIcon className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-semibold">
                            {role.name}
                          </span>
                          {role.isSystem ? (
                            <span className="inline-flex h-[18px] shrink-0 items-center rounded-md border border-border bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                              System
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {role.key}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3 align-middle">
                    <p className="text-xs leading-[1.45] text-pretty whitespace-normal text-muted-foreground">
                      {role.description}
                    </p>
                  </TableCell>
                  <TableCell className="p-3 align-middle">
                    <AssigneeStack assignees={role.assignees} />
                  </TableCell>
                  <TableCell className="p-3 align-middle">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs tabular-nums">
                        <span className="font-semibold text-foreground">
                          {granted}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          of {totalPermissionCount}
                        </span>
                      </p>
                      <Progress
                        value={(granted / totalPermissionCount) * 100}
                        aria-label={`${granted} of ${totalPermissionCount} permissions granted`}
                        className="w-[110px] gap-0"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-3 align-middle">
                    <RoleStatusBadge status={role.status} />
                  </TableCell>
                  <TableCell className="p-3 align-middle">
                    <p className="text-xs">{role.updatedAt}</p>
                    <p className="text-xs text-muted-foreground">
                      by {role.updatedBy}
                    </p>
                  </TableCell>
                  <TableCell className="p-3 align-middle">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        {/* The menu lives in a portal, so only the trigger's own
                            click can reach the row and open the sheet behind it. */}
                        <DropdownMenuTrigger
                          onClick={(event) => event.stopPropagation()}
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for ${role.name}`}
                            />
                          }
                        >
                          <MoreVerticalIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-49 min-w-49"
                        >
                          <DropdownMenuItem onClick={() => onView(role)}>
                            <EyeIcon />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(role)}>
                            <PencilIcon />
                            Edit role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(role)}>
                            <CopyIcon />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(role)}
                          >
                            <Trash2Icon />
                            Delete role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
