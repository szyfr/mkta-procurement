/**
 * Pagination is the one contract every FastAPI list endpoint shares — they are
 * all wrapped by `Helper.paginate` — so the envelope, the model it maps to, and
 * the query-param parsing live here rather than being restated per module.
 */

import { serverFetch } from "@/lib/api/fetcher";

export interface PaginationDto {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next_page: number | null;
  prev_page: number | null;
  search_term: string | null;
}

/** `Helper.paginate` wraps every list endpoint in this shape. */
export interface PaginatedDto<T> {
  data: T[];
  pagination: PaginationDto;
}

/** Page metadata, mapped from the backend's pagination envelope. */
export interface PageInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  nextPage: number | null;
  prevPage: number | null;
  /** Echoed back by the backend. Unused until list search ships. */
  searchTerm: string | null;
}

export function toPageInfo(pagination: PaginationDto): PageInfo {
  return {
    totalItems: pagination.total_items,
    totalPages: pagination.total_pages,
    currentPage: pagination.current_page,
    pageSize: pagination.page_size,
    nextPage: pagination.next_page,
    prevPage: pagination.prev_page,
    searchTerm: pagination.search_term,
  };
}

/** FastAPI caps `page_size` at 100. */
export const MAX_PAGE_SIZE = 100;

/** Keeps a caller-supplied page size inside what the backend accepts. */
export function clampPageSize(pageSize: number | undefined, fallback: number) {
  return Math.min(Math.max(pageSize ?? fallback, 1), MAX_PAGE_SIZE);
}

/** Reads a positive integer out of a query string, falling back when absent. */
export function readPageParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

/**
 * Walks every page of a paginated endpoint. Only safe for small collections —
 * used by lookup DALs that need the whole set to build an id → name map.
 */
export async function fetchAll<T>(path: string): Promise<T[]> {
  const first = await serverFetch<PaginatedDto<T>>(path, {
    query: { page: 1, page_size: MAX_PAGE_SIZE },
  });

  const { total_pages: totalPages } = first.pagination;
  if (totalPages <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      serverFetch<PaginatedDto<T>>(path, {
        query: { page: index + 2, page_size: MAX_PAGE_SIZE },
      }),
    ),
  );

  return [first.data, ...rest.map((page) => page.data)].flat();
}
