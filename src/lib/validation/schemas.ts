import { z } from "zod";

/**
 * Request validation, shared by every route handler.
 *
 * These schemas are the BFF's trust boundary: anything reaching a repository
 * has been through one. They are deliberately kept next to each other so the
 * accepted shape of the API can be read in one place.
 */

export const priority = z.enum(["High", "Normal", "Low"]);

export const purchaseRequestStatus = z.enum([
    "draft",
    "canvassing",
    "po-created",
    "partially-completed",
    "completed",
    "rejected",
]);

export const canvassingStatus = z.enum([
    "awaiting-quotes",
    "comparison-ready",
    "vendor-selected",
    "pending-exemption",
]);

export const sourcingMode = z.enum([
    "direct",
    "canvassing",
    "pending-item-creation",
]);

/** `YYYY-MM-DD`, the storage form for every calendar date. */
export const isoDate = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date in YYYY-MM-DD form.");

export const purchaseRequestItemInput = z.object({
    name: z.string().min(1, "An item needs a name."),
    quantity: z.number().positive("Quantity must be greater than zero."),
    unit: z.string().nullish(),
    estimatedUnitCost: z.number().nonnegative().nullish(),
    vendor: z.string().nullish(),
    sourcing: sourcingMode,
    notInCatalog: z.boolean().optional(),
});

export const createPurchaseRequest = z.object({
    title: z.string().nullish(),
    department: z.string().min(1, "A department is required."),
    dateNeeded: isoDate,
    priority,
    justification: z.string().nullish(),
    items: z.array(purchaseRequestItemInput).min(1, "Add at least one item."),
    status: purchaseRequestStatus.optional(),
});

export const updatePurchaseRequest = z.object({
    title: z.string().nullish(),
    department: z.string().min(1).optional(),
    dateNeeded: isoDate.optional(),
    priority: priority.optional(),
    items: z.array(purchaseRequestItemInput).optional(),
});

export const proofOfOrder = z.object({
    documentName: z.string().min(1, "Attach a document."),
    deliveredOn: isoDate,
    vendorRef: z.string().nullish(),
});

export const createItemCreationRequest = z.object({
    itemName: z.string().min(1, "An item name is required."),
    requestedFor: z.string().nullish(),
});

export const createBatch = z.object({
    itemIds: z.array(z.string().min(1)).min(1, "Select at least one item."),
    quotesRequired: z.number().int().positive().optional(),
});

export const createQuote = z.object({
    vendor: z.string().min(1, "Choose a vendor."),
    quoteRef: z.string().nullish(),
    quoteDate: isoDate,
    deliveryEstimate: z.string().min(1, "A delivery estimate is required."),
    paymentTerms: z.string().nullish(),
    documentName: z.string().nullish(),
    lines: z
        .array(
            z.object({
                itemId: z.string().min(1),
                quantity: z.number().positive(),
                unitPrice: z.number().nonnegative(),
            }),
        )
        .min(1, "A quote needs at least one priced line."),
});

export const selectVendor = z.object({
    quoteId: z.string().min(1, "Choose a quote."),
});

export const updateAccount = z.object({
    name: z.string().min(1).optional(),
    email: z.email("Enter a valid email address.").optional(),
    department: z.string().min(1).optional(),
});

export const login = z.object({
    email: z.email("Enter a valid email address."),
    password: z.string().min(1, "Enter your password."),
});

/** Query-string filters, which arrive as strings and need coercing. */
export const purchaseRequestQuery = z.object({
    status: purchaseRequestStatus.optional(),
    priority: priority.optional(),
    department: z.string().optional(),
    q: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
    listedOnly: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),
});

/**
 * The picker's page cursor. `pageSize` is capped at the backend's own limit so
 * a hand-crafted request cannot ask the BFF for more than it can fetch.
 */
export const catalogItemQuery = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(50),
    /** Blank and whitespace-only terms mean "no search", not "match nothing". */
    search: z
        .string()
        .trim()
        .optional()
        .transform((value) => value || undefined),
});

export const canvassingQuery = z.object({
    department: z.string().optional(),
    status: canvassingStatus.optional(),
});

export const reportQuery = z.object({
    dateRange: z.string().optional(),
    department: z.string().optional(),
    vendor: z.string().optional(),
});

export const searchQuery = z.object({
    q: z.string().optional(),
});

/** Turns `URLSearchParams` into a plain object before parsing. */
export function parseQuery<S extends z.ZodType>(
    schema: S,
    url: string,
): z.infer<S> {
    const params = new URL(url).searchParams;
    const raw: Record<string, string> = {};
    for (const [key, value] of params) {
        if (value !== "") raw[key] = value;
    }
    return schema.parse(raw) as z.infer<S>;
}
