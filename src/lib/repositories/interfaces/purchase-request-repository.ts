import type {
    Actor,
    CreatePurchaseRequestInput,
    Paginated,
    ProofOfOrderInput,
    PurchaseRequest,
    PurchaseRequestFilters,
    UpdatePurchaseRequestInput,
} from "@/types";

/**
 * Purchase requests, as an aggregate: a request always comes back with its
 * items, documents, comments and activity attached, because that is the unit
 * the API contract exposes and the unit a transaction has to write.
 */
export interface PurchaseRequestRepository {
    list(filters: PurchaseRequestFilters): Promise<Paginated<PurchaseRequest>>;
    getById(id: string): Promise<PurchaseRequest | null>;
    create(
        input: CreatePurchaseRequestInput,
        actor: Actor,
    ): Promise<PurchaseRequest>;
    update(
        id: string,
        input: UpdatePurchaseRequestInput,
        actor: Actor,
    ): Promise<PurchaseRequest>;
    delete(id: string): Promise<void>;
    /** Moves a draft into the workflow, routing items to canvassing as needed. */
    submit(id: string, actor: Actor): Promise<PurchaseRequest>;
    recordProofOfOrder(
        id: string,
        itemId: string,
        input: ProofOfOrderInput,
        actor: Actor,
    ): Promise<PurchaseRequest>;
}
