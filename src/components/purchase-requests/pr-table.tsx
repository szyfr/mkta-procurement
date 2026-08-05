import { ArrowRightIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  cellIdClass,
  dataTableClass,
  numericCellClass,
} from "@/components/shared/table-classes";
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
        <Table className={dataTableClass}>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">PR No.</TableHead>
              <TableHead scope="col">Title</TableHead>
              <TableHead scope="col">Requester</TableHead>
              <TableHead scope="col">Department</TableHead>
              <TableHead scope="col" className={numericCellClass}>
                Amount
              </TableHead>
              <TableHead scope="col">Priority</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Created</TableHead>
              <TableHead scope="col">
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
                  <TableCell className={cellIdClass}>{request.no}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {request.title ?? <span className="italic">Untitled</span>}
                  </TableCell>
                  <TableCell>
                    {request.requester ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {request.department ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className={numericCellClass}>
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
                  <TableCell>
                    <div className="flex flex-col items-start gap-1 text-xs">
                      <Link href={href} className="hover:underline">
                        Open
                        <ArrowRightIcon className="size-3.5" aria-hidden />
                      </Link>
                      {needsProof ? (
                        <Link
                          href={href}
                          className="text-status-ordered-fg hover:underline"
                        >
                          <PlusIcon className="size-3.5" aria-hidden />
                          Add Proof of Order
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
