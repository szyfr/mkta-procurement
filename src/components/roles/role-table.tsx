"use client";

import {
  EyeIcon,
  MoreVerticalIcon,
  PencilIcon,
  ShieldIcon,
  Trash2Icon,
} from "lucide-react";

import { GrantChip } from "@/components/roles/role-primitives";
import {
  dropdownContentClass,
  dropdownItemClass,
} from "@/components/shared/menu-classes";
import { dataTableClass } from "@/components/shared/table-classes";
import { TablePagination } from "@/components/shared/table-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Pagination } from "@/lib/api/pagination";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Role } from "@/modules/roles";

/**
 * The roles list. The whole row opens the read-only sheet; the actions menu
 * stops the click from reaching it so a menu item never opens both.
 *
 * `total_permissions` comes from `GET /permissions`, not from the role
 * itself — the backend has no role type, status or assignee data, so those
 * columns render a literal em-dash.
 */
export function RoleTable({
  roles,
  page,
  buildPageHref,
  totalPermissions,
  openRoleId,
  onView,
  onEdit,
  onDelete,
}: {
  roles: Role[];
  page: Pagination;
  buildPageHref: (page: number) => string;
  totalPermissions: number;
  /** Row left tinted while its sheet is open. */
  openRoleId?: string | null;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}) {
  return (
    <Card>
      <CardContent className="px-0">
        <Table className={cn("min-w-[960px]", dataTableClass)}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="w-[24%]">
                Role
              </TableHead>
              <TableHead scope="col" className="w-[30%]">
                Description
              </TableHead>
              <TableHead scope="col" className="w-[130px]">
                Assigned users
              </TableHead>
              <TableHead scope="col" className="w-[170px]">
                Permissions
              </TableHead>
              <TableHead scope="col" className="w-[100px]">
                Status
              </TableHead>
              <TableHead scope="col" className="w-[140px]">
                Last updated
              </TableHead>
              <TableHead scope="col" className="w-[56px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => {
              const granted = role.permission_ids.length;

              return (
                <TableRow
                  key={role._id}
                  className="cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  aria-selected={openRoleId === role._id}
                  onClick={() => onView(role)}
                >
                  <TableCell className="align-middle">
                    <div className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-0.5 flex size-6.5 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                      >
                        <ShieldIcon className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <span className="truncate font-semibold">
                          {role.title}
                        </span>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          —
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    <p className="text-xs leading-[1.45] text-pretty whitespace-normal text-muted-foreground">
                      {role.description}
                    </p>
                  </TableCell>
                  <TableCell className="align-middle text-xs text-muted-foreground">
                    —
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs tabular-nums">
                        <span className="font-semibold text-foreground">
                          {granted}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          of {totalPermissions}
                        </span>
                      </p>
                      <GrantChip granted={granted} total={totalPermissions} />
                    </div>
                  </TableCell>
                  <TableCell className="align-middle text-xs text-muted-foreground">
                    —
                  </TableCell>
                  <TableCell className="align-middle">
                    <p className="text-xs">
                      {formatDate(role.updated_at) ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell className="align-middle">
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
                              aria-label={`Actions for ${role.title}`}
                            />
                          }
                        >
                          <MoreVerticalIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className={cn(dropdownContentClass, "min-w-[196px]")}
                        >
                          <DropdownMenuItem
                            className={dropdownItemClass}
                            onClick={() => onView(role)}
                          >
                            <EyeIcon />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={dropdownItemClass}
                            onClick={() => onEdit(role)}
                          >
                            <PencilIcon />
                            Edit role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            className={dropdownItemClass}
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
      <TablePagination
        shown={roles.length}
        page={page}
        buildPageHref={buildPageHref}
      />
    </Card>
  );
}
