import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/shared/status-badge";
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
              {users.map((user) => (
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </>
  );
}
