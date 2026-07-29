import type { RequestContext } from "../interfaces";
import { FastApiClient } from "./client";
import { FastApiPurchaseRequestRepository } from "./purchase-request-repository";
import { FastApiReferenceRepository } from "./reference-repository";

/**
 * The aggregates the FastAPI backend actually serves.
 *
 * Purchase requests and reference data (departments, vendors, the material
 * catalog) have upstream endpoints. Everything else the UI needs — the
 * dashboard, canvassing, reports, notifications, search and settings — has no
 * counterpart yet and reads empty via `../unimplemented` instead.
 * The two halves are composed in `../repository-factory`, which is still the
 * only place the application decides where its data comes from.
 */

export { FastApiClient } from "./client";
export { invalidateDirectory } from "./directory";
export { FastApiPurchaseRequestRepository } from "./purchase-request-repository";
export { FastApiReferenceRepository } from "./reference-repository";

export function createFastApiRepositories(ctx: RequestContext) {
    const client = new FastApiClient(ctx);

    return {
        purchaseRequests: new FastApiPurchaseRequestRepository(client),
        reference: new FastApiReferenceRepository(client),
    };
}
