import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DataToolbar } from "@/components/shared/data-toolbar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  itemCreationRequests,
  itemCreationRequestTone,
} from "@/data/purchase-requests";

export const metadata: Metadata = {
  title: "Item Creation Requests",
};

export default function ItemCreationRequestsPage() {
  return (
    <>
      <Alert>
        <AlertDescription>
          Reached from a link inside Purchase Requests (not a sidebar tab) —
          this only tracks requests created while building a PR, or created
          directly here for master-data cases (new SKUs, materials) that
          aren&apos;t tied to a specific purchase yet.
        </AlertDescription>
      </Alert>

      <PageHeader
        title="Item Creation Requests"
        actions={
          <Button variant="outline" size="sm">
            <PlusIcon data-icon="inline-start" />
            New Item Creation Request
          </Button>
        }
      />

      <DataToolbar
        placeholder="Filter requests…"
        filters={[
          {
            label: "Status",
            options: ["Pending Review", "Approved", "Rejected"],
          },
        ]}
      />

      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="pl-4">
                  Item Name
                </TableHead>
                <TableHead scope="col">Requested For</TableHead>
                <TableHead scope="col">Requested By</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col">Submitted</TableHead>
                <TableHead scope="col" className="pr-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemCreationRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="pl-4 font-medium">
                    {request.itemName}
                  </TableCell>
                  <TableCell>
                    {request.requestedFor ? (
                      <Link
                        href={`/purchase-requests/${request.requestedFor}`}
                        className="hover:underline"
                      >
                        {request.requestedFor}
                      </Link>
                    ) : (
                      "Standalone (no PR yet)"
                    )}
                  </TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>
                    <StatusBadge tone={itemCreationRequestTone[request.status]}>
                      {request.statusLabel}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {request.submittedOn}
                  </TableCell>
                  <TableCell className="pr-4 text-xs text-muted-foreground">
                    Open →
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
