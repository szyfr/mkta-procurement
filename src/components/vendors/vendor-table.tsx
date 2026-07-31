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
import type { PageInfo, Vendor } from "@/modules/vendors";

/** Page numbers to render, windowed so long result sets stay readable. */
function pageWindow(current: number, total: number) {
  const start = Math.max(1, Math.min(current - 1, total - 2));
  const end = Math.min(total, start + 2);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function VendorTable({
  vendors,
  page,
  buildPageHref,
}: {
  vendors: Vendor[];
  page: PageInfo;
  buildPageHref: (page: number) => string;
}) {
  return (
    <Card>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="pl-4">
                Vendor No.
              </TableHead>
              <TableHead scope="col">Vendor Name</TableHead>
              <TableHead scope="col">Vendor ID</TableHead>
              <TableHead scope="col">Created At</TableHead>
              <TableHead scope="col" className="pr-4">
                Updated At
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="pl-4 font-medium">
                  {vendor.no || "—"}
                </TableCell>
                <TableCell>{vendor.name || "—"}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {vendor.vendorId || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {vendor.createdAt ?? "—"}
                </TableCell>
                <TableCell className="pr-4 text-muted-foreground">
                  {vendor.updatedAt ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Showing {vendors.length} of {page.totalItems}
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
