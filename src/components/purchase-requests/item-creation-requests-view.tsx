"use client";

import Link from "next/link";

import { DataToolbar } from "@/components/shared/data-toolbar";
import { DataError, TableSkeleton } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useItemCreationRequests } from "@/hooks/purchase-requests";
import { itemCreationRequestTone } from "@/lib/status-tones";

export function ItemCreationRequestsView() {
  const { data, isPending, isError, error, refetch } =
    useItemCreationRequests();

  return (
    <>
      <DataToolbar
        placeholder="Filter requests…"
        filters={[
          {
            label: "Status",
            options: ["Pending Review", "Approved", "Rejected"],
          },
        ]}
      />

      {isError ? (
        <DataError error={error} onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardContent className="px-0">
            {isPending ? (
              <TableSkeleton rows={3} columns={6} />
            ) : (
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
                  {data.map((request) => (
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
                        <StatusBadge
                          tone={itemCreationRequestTone[request.status]}
                        >
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
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
