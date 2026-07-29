import { requesterDisplayName } from "@/lib/auth/session";
import { ApiError } from "@/lib/http/errors";
import type {
    Actor,
    CreatePurchaseRequestInput,
    Paginated,
    PurchaseRequest,
    PurchaseRequestFilters,
    PurchaseRequestItemInput,
    UpdatePurchaseRequestInput,
} from "@/types";
import type { PurchaseRequestRepository } from "../interfaces";
import type { FastApiClient } from "./client";
import {
    materialByName,
    resolveDepartmentId,
    resolveVendorId,
} from "./directory";
import {
    type PurchaseRequestDoc,
    toIsoDatePart,
    toPurchaseRequest,
    toUpstreamPriority,
} from "./mappers";

const DEFAULT_PAGE_SIZE = 25;

interface UpstreamItem {
    material_id: string;
    quantity: number;
    vendor_id: string | null;
}

interface PurchaseRequestList {
    data: PurchaseRequestDoc[];
    pagination: { total_items: number };
}

export class FastApiPurchaseRequestRepository
    implements PurchaseRequestRepository
{
    constructor(private readonly client: FastApiClient) {}

    async list(
        filters: PurchaseRequestFilters,
    ): Promise<Paginated<PurchaseRequest>> {
        const page = Math.max(1, filters.page ?? 1);
        const pageSize = Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE);

        // TODO(backend): the upstream index only supports `search` (a regex over
        // title and justification). `status`, `priority`, `department` and
        // `listedOnly` have no counterpart and are accepted but ignored — the
        // toolbar's filters will not narrow the list until the API grows them.
        const response = await this.client.get<PurchaseRequestList>(
            "/purchase-requests",
            { page, page_size: pageSize, search: filters.q },
        );

        const items = await Promise.all(
            response.data.map((doc) =>
                toPurchaseRequest(this.client, doc, this.requesterFor(doc)),
            ),
        );

        return {
            items,
            total: response.pagination.total_items,
            page,
            pageSize,
        };
    }

    async getById(id: string): Promise<PurchaseRequest | null> {
        const doc = await this.client.get<PurchaseRequestDoc>(
            `/purchase-requests/${id}`,
        );
        return toPurchaseRequest(this.client, doc, this.requesterFor(doc));
    }

    async create(
        input: CreatePurchaseRequestInput,
        actor: Actor,
    ): Promise<PurchaseRequest> {
        const doc = await this.client.post<PurchaseRequestDoc>(
            "/purchase-requests",
            {
                requester_id: actor.id,
                department_id: await this.departmentId(input.department),
                title: input.title ?? "",
                date_needed: this.dateNeeded(input.dateNeeded),
                priority: toUpstreamPriority(input.priority),
                // The upstream request model types this as a required `str`.
                justification: input.justification ?? "",
                items: await this.items(input.items),
            },
        );

        return toPurchaseRequest(this.client, doc, this.requesterFor(doc));
    }

    /**
     * The upstream verb is PUT, and it replaces the item collection wholesale —
     * every item is soft-deleted and recreated, so item ids do not survive an
     * edit. Nothing above this layer depends on them across a mutation.
     *
     * It also cannot be sent a partial body. The controller iterates
     * `payload["items"]` unconditionally, and the field defaults to `None`, so
     * editing only a title raises `'NoneType' object is not iterable` upstream
     * and comes back as a 500. Re-sending the request's current items is the only
     * way to make a partial edit work.
     * TODO(backend): make PUT tolerate an absent `items`, then drop the read.
     */
    async update(
        id: string,
        input: UpdatePurchaseRequestInput,
        _actor: Actor,
    ): Promise<PurchaseRequest> {
        const items =
            input.items === undefined
                ? await this.currentItems(id)
                : await this.items(input.items);

        const doc = await this.client.put<PurchaseRequestDoc>(
            `/purchase-requests/${id}`,
            {
                ...(input.title === undefined
                    ? {}
                    : { title: input.title ?? "" }),
                ...(input.department === undefined
                    ? {}
                    : {
                          department_id: await this.departmentId(
                              input.department,
                          ),
                      }),
                ...(input.dateNeeded === undefined
                    ? {}
                    : { date_needed: this.dateNeeded(input.dateNeeded) }),
                ...(input.priority === undefined
                    ? {}
                    : { priority: toUpstreamPriority(input.priority) }),
                items,
            },
        );

        return toPurchaseRequest(this.client, doc, this.requesterFor(doc));
    }

    /** The request's items as the upstream write shape, read back verbatim. */
    private async currentItems(id: string): Promise<UpstreamItem[]> {
        const doc = await this.client.get<PurchaseRequestDoc>(
            `/purchase-requests/${id}`,
        );

        return (doc.items ?? [])
            .filter((item) => item.material_id !== null)
            .map((item) => ({
                material_id: item.material_id as string,
                quantity: item.quantity,
                vendor_id: item.vendor_id,
            }));
    }

    async delete(id: string): Promise<void> {
        await this.client.delete<void>(`/purchase-requests/${id}`);
    }

    async submit(_id: string, _actor: Actor): Promise<PurchaseRequest> {
        // TODO(backend): submitting has to set a status, route items to canvassing
        // and raise purchase orders. None of that exists upstream yet.
        throw ApiError.notImplemented(
            "Submitting a purchase request is not supported by the backend yet.",
        );
    }

    async recordProofOfOrder(): Promise<PurchaseRequest> {
        // TODO(backend): needs item-level delivery state and document storage.
        throw ApiError.notImplemented(
            "Recording proof of order is not supported by the backend yet.",
        );
    }

    /**
     * `requester_id` is an opaque string reserved for a Cognito user pool id,
     * and the backend has no user collection to join against, so the name is
     * resolved against the same single principal the session comes from. Reads
     * and writes go through here alike, which is what keeps a request from
     * being authored by "Procurement User" and then listed under its raw id.
     */
    private requesterFor(doc: PurchaseRequestDoc): string {
        return requesterDisplayName(doc.requester_id);
    }

    private async departmentId(name: string): Promise<string> {
        const id = await resolveDepartmentId(this.client, name);
        if (!id) {
            throw ApiError.badRequest(`Unknown department: "${name}".`);
        }
        return id;
    }

    /** The upstream requires a date; the form now always supplies one. */
    private dateNeeded(value: string | null | undefined): string {
        const iso = toIsoDatePart(value);
        if (!iso) {
            throw ApiError.badRequest("A date needed is required.");
        }
        return iso;
    }

    /**
     * The DTO identifies an item by name; the upstream needs a `material_id`.
     * Resolution happens against the cached directory rather than the API's
     * regex search, which would misbehave on any description containing regex
     * punctuation.
     */
    private async items(
        inputs: PurchaseRequestItemInput[],
    ): Promise<UpstreamItem[]> {
        return Promise.all(
            inputs.map(async (item) => {
                const material = await materialByName(this.client, item.name);
                if (!material) {
                    // TODO(backend): there is no way to submit an off-catalog line —
                    // `material_id` is mandatory. Items flagged `notInCatalog` have to
                    // go through an item creation request first.
                    throw ApiError.badRequest(
                        `"${item.name}" is not in the material catalog, so it cannot be ordered yet.`,
                    );
                }

                return {
                    material_id: material.id,
                    quantity: item.quantity,
                    vendor_id: await resolveVendorId(this.client, item.vendor),
                };
            }),
        );
    }
}
