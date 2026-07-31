import { serverFetch } from "@/lib/api/fetcher";
import {
  clampPageSize,
  MAX_PAGE_SIZE,
  type PaginatedDto,
  toPageInfo,
} from "@/lib/api/pagination";
import { LOOKUP_PAGE_SIZE } from "@/modules/purchase-requests/constants";
import type {
  DepartmentDto,
  MaterialDto,
  VendorDto,
} from "@/modules/purchase-requests/dto";
import {
  type NameLookup,
  toDepartmentLookup,
  toDepartmentOption,
  toMaterialOption,
  toVendorLookup,
  toVendorOption,
} from "@/modules/purchase-requests/mappers/purchase-request.mapper";
import type { LookupPage } from "@/modules/purchase-requests/models/purchase-request";

/**
 * Reference data reads. Server-side only — this talks to FastAPI, never to the
 * BFF.
 *
 * Purchase requests store `department_id` and `vendor_id` but the backend joins
 * neither, and offers no by-id endpoint for either. Resolving names therefore
 * means pulling the full (small) collections and indexing them, which is what
 * the memoized loaders below do.
 */

export interface LookupQuery {
  page?: number;
  pageSize?: number;
  search?: string | null;
}

/** Walks every page of a paginated endpoint. Only safe for small collections. */
async function fetchAll<T>(path: string): Promise<T[]> {
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

/**
 * Name lookups are read on every list and detail render but change rarely, so
 * they are memoized for a short window. The cache is per server process; a
 * cold instance simply refetches.
 */
const LOOKUP_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  value: Promise<NameLookup>;
  expiresAt: number;
}

const lookupCache = new Map<string, CacheEntry>();

function memoizeLookup(key: string, load: () => Promise<NameLookup>) {
  const cached = lookupCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const value = load().catch((error) => {
    // Never cache a failure — the next caller should retry.
    lookupCache.delete(key);
    throw error;
  });

  lookupCache.set(key, { value, expiresAt: Date.now() + LOOKUP_TTL_MS });

  return value;
}

export function getDepartmentLookup() {
  return memoizeLookup("departments", async () =>
    toDepartmentLookup(await fetchAll<DepartmentDto>("/departments")),
  );
}

export function getVendorLookup() {
  return memoizeLookup("vendors", async () =>
    toVendorLookup(await fetchAll<VendorDto>("/vendors")),
  );
}

export async function listDepartments(): Promise<LookupPage> {
  const response = await serverFetch<PaginatedDto<DepartmentDto>>(
    "/departments",
    { query: { page: 1, page_size: MAX_PAGE_SIZE } },
  );

  return {
    options: response.data.map(toDepartmentOption),
    page: toPageInfo(response.pagination),
  };
}

export async function listMaterials(
  query: LookupQuery = {},
): Promise<LookupPage> {
  const response = await serverFetch<PaginatedDto<MaterialDto>>("/materials", {
    query: {
      page: query.page ?? 1,
      page_size: clampPageSize(query.pageSize, LOOKUP_PAGE_SIZE),
      search: query.search || undefined,
    },
  });

  return {
    options: response.data.map(toMaterialOption),
    page: toPageInfo(response.pagination),
  };
}

export async function listVendors(
  query: LookupQuery = {},
): Promise<LookupPage> {
  const response = await serverFetch<PaginatedDto<VendorDto>>("/vendors", {
    query: {
      page: query.page ?? 1,
      page_size: clampPageSize(query.pageSize, LOOKUP_PAGE_SIZE),
      search: query.search || undefined,
    },
  });

  return {
    options: response.data.map(toVendorOption),
    page: toPageInfo(response.pagination),
  };
}
