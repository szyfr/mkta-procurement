import type {
    Actor,
    CanvassingCase,
    CanvassingDetail,
    CreateBatchInput,
    CreateQuoteInput,
    SelectVendorInput,
    VendorQuote,
} from "@/types";

export interface CanvassingFilters {
    department?: string;
    status?: CanvassingCase["status"];
}

export interface CanvassingRepository {
    /**
     * The list view is one row per item per batch, so a request whose items were
     * awarded to different vendors appears as several rows.
     */
    listCases(filters: CanvassingFilters): Promise<CanvassingCase[]>;
    getDetail(purchaseRequestId: string): Promise<CanvassingDetail | null>;
    createBatch(
        purchaseRequestId: string,
        input: CreateBatchInput,
        actor: Actor,
    ): Promise<{ batch: number }>;
    addQuote(
        purchaseRequestId: string,
        batch: number,
        input: CreateQuoteInput,
        actor: Actor,
    ): Promise<VendorQuote>;
    /** Awards the batch, which creates the purchase order for its items. */
    selectVendor(
        purchaseRequestId: string,
        batch: number,
        input: SelectVendorInput,
        actor: Actor,
    ): Promise<CanvassingDetail>;
}
