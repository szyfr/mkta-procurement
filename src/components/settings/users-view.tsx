"use client";

import { PlusIcon, ShieldIcon, UsersIcon } from "lucide-react";

import { DataError, TableSkeleton } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRolePermissions, useUsers } from "@/hooks/settings";
import { userStatusTone } from "@/lib/status-tones";

export function UsersView() {
  const users = useUsers();
  const roles = useRolePermissions();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2 border-b">
          <div className="flex flex-col gap-1">
            <CardTitle>Users</CardTitle>
            <CardDescription>
              People with access to this procurement module.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <PlusIcon data-icon="inline-start" />
            Invite User
          </Button>
        </CardHeader>

        <CardContent className="px-0">
          {users.isError ? (
            <div className="px-4">
              <DataError error={users.error} onRetry={() => users.refetch()} />
            </div>
          ) : users.isPending ? (
            <TableSkeleton rows={4} columns={5} />
          ) : users.data.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UsersIcon />
                </EmptyMedia>
                <EmptyTitle>No users yet</EmptyTitle>
                <EmptyDescription>
                  Invite someone to give them access to this procurement module.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="pl-4">
                    Name
                  </TableHead>
                  <TableHead scope="col">Role</TableHead>
                  <TableHead scope="col">Department</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col" className="pr-4">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="pl-4">
                      {user.name}
                      {user.isCurrentUser ? " (you)" : ""}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <StatusBadge tone={userStatusTone[user.status]}>
                        {user.status === "active" ? "Active" : "Invited"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="pr-4">
                      {user.isCurrentUser ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <Button variant="link" size="sm" className="h-auto p-0">
                          {user.status === "invited" ? "Resend" : "Edit"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          {roles.isPending ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list, never reordered
                <Skeleton key={`role-${index}`} className="h-4 w-full" />
              ))}
            </div>
          ) : (roles.data ?? []).length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShieldIcon />
                </EmptyMedia>
                <EmptyTitle>No roles defined</EmptyTitle>
                <EmptyDescription>
                  Role permissions will appear here once configured.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <dl className="divide-y text-xs">
              {(roles.data ?? []).map((permission) => (
                <div
                  key={permission.role}
                  className="flex flex-col justify-between gap-1 py-1.5 sm:flex-row sm:items-center sm:gap-4"
                >
                  <dt>{permission.role}</dt>
                  <dd className="text-muted-foreground sm:text-right">
                    {permission.description}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>
    </>
  );
}
