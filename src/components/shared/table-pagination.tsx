import { CardFooter } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
// Aliased only because shadcn's `Pagination` component shares the name.
import type { Pagination as PaginationEnvelope } from "@/lib/api/pagination";

/** Page numbers to render, windowed so long result sets stay readable. */
function pageWindow(current: number, total: number) {
  const start = Math.max(1, Math.min(current - 1, total - 2));
  const end = Math.min(total, start + 2);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/**
 * Footer every paginated list card ends with: how much of the collection is on
 * screen, plus the page links when there is more than one page.
 *
 * Reads the backend's pagination envelope as it arrives — `total_items`,
 * `next_page` and the rest are the field names FastAPI sent.
 */
export function TablePagination({
  shown,
  page,
  buildPageHref,
}: {
  /** Rows currently rendered, which is the page size on all but the last page. */
  shown: number;
  page: PaginationEnvelope;
  /** Keeps any other URL state (e.g. the cards/table view) intact while paging. */
  buildPageHref: (page: number) => string;
}) {
  return (
    <CardFooter className="justify-between gap-2 text-xs text-muted-foreground">
      <span>
        Showing {shown} of {page.total_items}
      </span>
      {page.total_pages > 1 ? (
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={buildPageHref(page.prev_page ?? 1)}
                aria-disabled={page.prev_page === null}
                className={
                  page.prev_page === null
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
            {pageWindow(page.current_page, page.total_pages).map(
              (pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={buildPageHref(pageNumber)}
                    isActive={pageNumber === page.current_page}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href={buildPageHref(page.next_page ?? page.total_pages)}
                aria-disabled={page.next_page === null}
                className={
                  page.next_page === null
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
