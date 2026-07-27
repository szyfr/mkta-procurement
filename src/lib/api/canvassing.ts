import type {
  CanvassingCase,
  CanvassingDetail,
  CreateBatchInput,
  CreateQuoteInput,
  SelectVendorInput,
  VendorQuote,
} from "@/types";

import { apiClient, type QueryParams } from "./client";

export interface CanvassingListFilters {
  department?: string;
  status?: CanvassingCase["status"];
}

export const canvassingApi = {
  list: (filters: CanvassingListFilters = {}, signal?: AbortSignal) =>
    apiClient.get<CanvassingCase[]>(
      "/canvassing",
      filters as QueryParams,
      signal,
    ),

  get: (purchaseRequestId: string, signal?: AbortSignal) =>
    apiClient.get<CanvassingDetail>(
      `/canvassing/${purchaseRequestId}`,
      undefined,
      signal,
    ),

  createBatch: (purchaseRequestId: string, input: CreateBatchInput) =>
    apiClient.post<{ batch: number }>(
      `/canvassing/${purchaseRequestId}/batches`,
      input,
    ),

  addQuote: (
    purchaseRequestId: string,
    batch: number,
    input: CreateQuoteInput,
  ) =>
    apiClient.post<VendorQuote>(
      `/canvassing/${purchaseRequestId}/batches/${batch}/quotes`,
      input,
    ),

  selectVendor: (
    purchaseRequestId: string,
    batch: number,
    input: SelectVendorInput,
  ) =>
    apiClient.post<CanvassingDetail>(
      `/canvassing/${purchaseRequestId}/batches/${batch}/select-vendor`,
      input,
    ),
};
