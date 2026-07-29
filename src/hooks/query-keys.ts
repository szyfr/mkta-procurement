import type { CanvassingListFilters } from "@/lib/api";
import type { PurchaseRequestFilters, ReportFilters } from "@/types";

/**
 * Every cache key in one place.
 *
 * Mutations invalidate by prefix — `queryKeys.purchaseRequests.all` clears both
 * the lists and the details — so the keys have to nest consistently. Scattering
 * inline arrays across hooks is what makes invalidation quietly miss.
 */
export const queryKeys = {
    session: ["session"] as const,

    dashboard: ["dashboard"] as const,

    purchaseRequests: {
        all: ["purchase-requests"] as const,
        list: (filters: PurchaseRequestFilters = {}) =>
            ["purchase-requests", "list", filters] as const,
        detail: (id: string) => ["purchase-requests", "detail", id] as const,
    },

    itemCreationRequests: ["item-creation-requests"] as const,

    canvassing: {
        all: ["canvassing"] as const,
        list: (filters: CanvassingListFilters = {}) =>
            ["canvassing", "list", filters] as const,
        detail: (purchaseRequestId: string) =>
            ["canvassing", "detail", purchaseRequestId] as const,
    },

    reports: {
        all: ["reports"] as const,
        list: ["reports", "list"] as const,
        detail: (id: string, filters: ReportFilters = {}) =>
            ["reports", "detail", id, filters] as const,
    },

    notifications: ["notifications"] as const,

    search: (query: string) => ["search", query] as const,

    settings: {
        account: ["settings", "account"] as const,
        users: ["settings", "users"] as const,
        roles: ["settings", "roles"] as const,
    },

    reference: {
        departments: ["reference", "departments"] as const,
        vendors: ["reference", "vendors"] as const,
        paymentTerms: ["reference", "payment-terms"] as const,
        catalogItems: ["reference", "catalog-items"] as const,
    },
} as const;
