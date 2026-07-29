import Link from "next/link";

import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { purchaseRequestTone } from "@/data/purchase-requests";
import type { PurchaseRequest } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import type { PageInfo } from "@/modules/purchase-requests";

/** Page numbers to render, windowed so long result sets stay readable. */
function pageWindow(current: number, total: number) {
  const start = Math.max(1, Math.min(current - 1, total - 2));
  const end = Math.min(total, start + 2);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

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
              const href =
                request.status === "draft"
                  ? "/purchase-requests/new"
                  : `/purchase-requests/${request.id}`;
              const needsProof =
                request.status === "po-created" ||
                request.status === "partially-completed";

              return (
                <TableRow key={request.id}>
                  <TableCell className="pl-4 font-medium">
                    {request.id}
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
                          href={`/purchase-requests/${request.id}`}
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
      <CardFooter className="justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Showing {requests.length} of {page.totalItems}
        </span>
        {page.totalPages > 1 ? (
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(page.prevPage ?? 1)}
                  aria-disabled={page.prevPage === null}
                  className={
                    page.prevPage === null
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
              {pageWindow(page.currentPage, page.totalPages).map(
                (pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href={buildPageHref(pageNumber)}
                      isActive={pageNumber === page.currentPage}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href={buildPageHref(page.nextPage ?? page.totalPages)}
                  aria-disabled={page.nextPage === null}
                  className={
                    page.nextPage === null
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </CardFooter>
    </Card>
  );
}
