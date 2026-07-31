import { CardFooter } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PageInfo } from "@/lib/api/pagination";

/** Page numbers to render, windowed so long result sets stay readable. */
function pageWindow(current: number, total: number) {
  const start = Math.max(1, Math.min(current - 1, total - 2));
  const end = Math.min(total, start + 2);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/**
 * Footer every paginated list card ends with: how much of the collection is on
 * screen, plus the page links when there is more than one page.
 */
export function TablePagination({
  shown,
  page,
  buildPageHref,
}: {
  /** Rows currently rendered, which is the page size on all but the last page. */
  shown: number;
  page: PageInfo;
  /** Keeps any other URL state (e.g. the cards/table view) intact while paging. */
  buildPageHref: (page: number) => string;
}) {
  return (
    <CardFooter className="justify-between gap-2 text-xs text-muted-foreground">
      <span>
        Showing {shown} of {page.totalItems}
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
            {pageWindow(page.currentPage, page.totalPages).map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href={buildPageHref(pageNumber)}
                  isActive={pageNumber === page.currentPage}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
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
  );
}
