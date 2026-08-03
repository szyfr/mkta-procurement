import type { PageInfo } from "@/lib/api/pagination";

/** Domain object used throughout the Payment Terms UI. */
export interface PaymentTerm {
  id: string;
  title: string;
  description: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PaymentTermList {
  paymentTerms: PaymentTerm[];
  page: PageInfo;
}

/**
 * What the UI submits to create or update a payment term. The BFF validates
 * this shape before it becomes a DTO, so it is shared by the API client and
 * the Route Handlers rather than owned by either.
 */
export interface PaymentTermPayload {
  title: string;
  description: string;
}
