import { serverFetch } from "@/lib/api/fetcher";
import {
  clampPageSize,
  type PaginatedDto,
  toPageInfo,
} from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/vendors/constants";
import type { VendorDto } from "@/modules/vendors/dto";
import { toVendor } from "@/modules/vendors/mappers/vendor.mapper";
import type { VendorList } from "@/modules/vendors/models/vendor";

/**
 * Vendor reads against FastAPI. Server-side only, called from Route Handlers —
 * never from a component.
 *
 * Only the list is wired up; FastAPI exposes no create, update, delete or
 * by-id read for vendors yet.
 */

export interface ListVendorsQuery {
  page?: number;
  pageSize?: number;
}

export async function listVendors(
  query: ListVendorsQuery = {},
): Promise<VendorList> {
  const response = await serverFetch<PaginatedDto<VendorDto>>("/vendors", {
    query: {
      page: query.page ?? 1,
      page_size: clampPageSize(query.pageSize, DEFAULT_PAGE_SIZE),
    },
  });

  return {
    vendors: response.data.map(toVendor),
    page: toPageInfo(response.pagination),
  };
}
