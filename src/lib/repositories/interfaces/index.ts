import type { CanvassingRepository } from "./canvassing-repository";
import type { PurchaseRequestRepository } from "./purchase-request-repository";
import type {
    DashboardRepository,
    ItemCreationRequestRepository,
    NotificationRepository,
    ReferenceRepository,
    ReportRepository,
    SearchRepository,
    UserRepository,
} from "./support-repositories";

export type {
    CanvassingFilters,
    CanvassingRepository,
} from "./canvassing-repository";
export type { PurchaseRequestRepository } from "./purchase-request-repository";
export type * from "./support-repositories";

/**
 * Everything a route handler needs, resolved in one place.
 *
 * Handlers depend on this bundle rather than on a concrete implementation, so
 * no route knows — or can find out — whether it is talking to SQLite or to a
 * remote service.
 */
export interface Repositories {
    purchaseRequests: PurchaseRequestRepository;
    itemCreationRequests: ItemCreationRequestRepository;
    canvassing: CanvassingRepository;
    dashboard: DashboardRepository;
    reports: ReportRepository;
    notifications: NotificationRepository;
    search: SearchRepository;
    users: UserRepository;
    reference: ReferenceRepository;
}

/**
 * Per-request state the repositories may need.
 *
 * The SQLite implementations ignore it. The FastAPI ones use `cookie` to
 * forward the browser's credentials upstream and `relaySetCookie` to hand a
 * refreshed session back down — which is how HttpOnly auth stays transparent to
 * React.
 */
export interface RequestContext {
    cookie: string | null;
    relaySetCookie?: (value: string) => void;
}
