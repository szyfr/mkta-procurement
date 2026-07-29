import type {
    CreateItemCreationRequestInput,
    CreatePurchaseRequestInput,
    ItemCreationRequest,
    ProofOfOrderInput,
    PurchaseRequest,
    PurchaseRequestFilters,
    UpdatePurchaseRequestInput,
} from "@/types";

import { apiClient, type QueryParams } from "./client";

export interface PurchaseRequestPage {
    items: PurchaseRequest[];
    total: number;
}

export const purchaseRequestsApi = {
    async list(
        filters: PurchaseRequestFilters = {},
        signal?: AbortSignal,
    ): Promise<PurchaseRequestPage> {
        const { data, meta } = await apiClient.getWithMeta<PurchaseRequest[]>(
            "/purchase-requests",
            filters as QueryParams,
            signal,
        );
        return { items: data, total: Number(meta?.total ?? data.length) };
    },

    get: (id: string, signal?: AbortSignal) =>
        apiClient.get<PurchaseRequest>(
            `/purchase-requests/${id}`,
            undefined,
            signal,
        ),

    create: (input: CreatePurchaseRequestInput) =>
        apiClient.post<PurchaseRequest>("/purchase-requests", input),

    update: (id: string, input: UpdatePurchaseRequestInput) =>
        apiClient.patch<PurchaseRequest>(`/purchase-requests/${id}`, input),

    remove: (id: string) => apiClient.delete<void>(`/purchase-requests/${id}`),

    submit: (id: string) =>
        apiClient.post<PurchaseRequest>(`/purchase-requests/${id}/submit`),

    recordProofOfOrder: (
        id: string,
        itemId: string,
        input: ProofOfOrderInput,
    ) =>
        apiClient.post<PurchaseRequest>(
            `/purchase-requests/${id}/items/${itemId}/proof-of-order`,
            input,
        ),
};

export const itemCreationRequestsApi = {
    list: (signal?: AbortSignal) =>
        apiClient.get<ItemCreationRequest[]>(
            "/item-creation-requests",
            undefined,
            signal,
        ),

    create: (input: CreateItemCreationRequestInput) =>
        apiClient.post<ItemCreationRequest>("/item-creation-requests", input),
};
