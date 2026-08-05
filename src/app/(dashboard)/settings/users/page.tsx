import { PlusIcon, ShieldIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/shared/status-badge";
import { dataTableClass } from "@/components/shared/table-classes";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rolePermissions, userStatusTone, users } from "@/data/users";

export const metadata: Metadata = {
  title: "Users & Roles",
};

export default function UsersSettingsPage() {
  return (
    <>
      <Alert>
        <AlertDescription>
          Visible only to the Administrator role. Everyone else manages their
          own profile under My Account instead.
        </AlertDescription>
      </Alert>

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
          {users.length === 0 ? (
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
            <Table className={dataTableClass}>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Name</TableHead>
                  <TableHead scope="col">Role</TableHead>
                  <TableHead scope="col">Department</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
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
                    <TableCell>
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
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          {rolePermissions.length === 0 ? (
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
              {rolePermissions.map((permission) => (
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
