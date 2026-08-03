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
  toDepartmentOption,
  toMaterialOption,
  toVendorOption,
} from "@/modules/purchase-requests/mappers/purchase-request.mapper";
import type { LookupPage } from "@/modules/purchase-requests/models/purchase-request";

/**
 * Reference data reads for the create and edit form pickers. Server-side only —
 * this talks to FastAPI, never to the BFF.
 *
 * These are searchable, paginated lists, not name resolution. Purchase requests
 * store `department_id` and `vendor_id` and the backend joins neither, so those
 * ids render as-is until it does.
 */

export interface LookupQuery {
  page?: number;
  pageSize?: number;
  search?: string | null;
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
