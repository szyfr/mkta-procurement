import Link from "next/link";

import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { TablePagination } from "@/components/shared/table-pagination";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PageInfo } from "@/lib/api/pagination";
import { formatCurrency } from "@/lib/utils";
import {
  type PurchaseRequest,
  purchaseRequestTone,
} from "@/modules/purchase-requests";

export function PurchaseRequestTable({
  requests,
  page,
  buildPageHref,
}: {
  requests: PurchaseRequest[];
  page: PageInfo;
  /** Keeps the current view (cards/table) intact while changing pages. */
  buildPageHref: (page: number) => string;
}) {
  return (
    <Card>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="pl-4">
                PR No.
              </TableHead>
              <TableHead scope="col">Title</TableHead>
              <TableHead scope="col">Requester</TableHead>
              <TableHead scope="col">Department</TableHead>
              <TableHead scope="col">Amount</TableHead>
              <TableHead scope="col">Priority</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Created</TableHead>
              <TableHead scope="col" className="pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const href = `/purchase-requests/${request.id}`;
              const needsProof =
                request.status === "po-created" ||
                request.status === "partially-completed";

              return (
                <TableRow key={request.id}>
                  <TableCell className="pl-4 font-medium">
                    {request.no}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {request.title ?? <span className="italic">Untitled</span>}
                  </TableCell>
                  <TableCell>{request.requester}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>
                    {request.amount === null ? (
                      <span
                        className="text-muted-foreground"
                        title="No estimated amount on file"
                      >
                        —
                      </span>
                    ) : (
                      formatCurrency(request.amount)
                    )}
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={request.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={purchaseRequestTone[request.status]}>
                      {request.statusLabel}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {request.createdAt ?? "Not submitted"}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex flex-col items-start gap-1 text-xs">
                      <Link href={href} className="hover:underline">
                        Open →
                      </Link>
                      {needsProof ? (
                        <Link
                          href={href}
                          className="text-status-ordered hover:underline"
                        >
                          + Add Proof of Order
                        </Link>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <TablePagination
        shown={requests.length}
        page={page}
        buildPageHref={buildPageHref}
      />
    </Card>
  );
}
