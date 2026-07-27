import type {
  Priority,
  PurchaseRequestStatus,
  SourcingMode,
} from "@/lib/types";

/** Uniform success envelope returned by every BFF route. */
export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_FAILED"
  | "NOT_IMPLEMENTED"
  | "INTERNAL";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** The authenticated principal threaded from the BFF into repositories. */
export interface Actor {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface PurchaseRequestFilters {
  status?: PurchaseRequestStatus;
  priority?: Priority;
  department?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  /**
   * When true (the default) only requests with a `listOrder` are returned, in
   * that order — the curated list the wireframes specify. Set false to search
   * across every request.
   */
  listedOnly?: boolean;
}

export interface PurchaseRequestItemInput {
  name: string;
  quantity: number;
  unit?: string | null;
  estimatedUnitCost?: number | null;
  vendor?: string | null;
  sourcing: SourcingMode;
  notInCatalog?: boolean;
}

export interface CreatePurchaseRequestInput {
  title?: string | null;
  department: string;
  priority: Priority;
  justification?: string | null;
  items: PurchaseRequestItemInput[];
}

export interface UpdatePurchaseRequestInput {
  title?: string | null;
  department?: string;
  priority?: Priority;
  items?: PurchaseRequestItemInput[];
}

export interface ProofOfOrderInput {
  documentName: string;
  deliveredOn: string;
  vendorRef?: string | null;
}

export interface CreateBatchInput {
  itemIds: string[];
  quotesRequired?: number;
}

export interface CreateQuoteInput {
  vendor: string;
  quoteRef?: string | null;
  quoteDate: string;
  deliveryEstimate: string;
  paymentTerms?: string | null;
  documentName?: string | null;
  lines: { itemId: string; quantity: number; unitPrice: number }[];
}

export interface SelectVendorInput {
  quoteId: string;
}

export interface CreateItemCreationRequestInput {
  itemName: string;
  requestedFor?: string | null;
}

export interface UpdateAccountInput {
  name?: string;
  email?: string;
  department?: string;
}
