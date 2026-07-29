import "server-only";

import { ApiError } from "@/lib/http/errors";

import type {
    Actor,
    CanvassingCase,
    CanvassingDetail,
    DashboardData,
    ItemCreationRequest,
    Notification,
    ReportData,
    ReportSummary,
    RolePermission,
    SearchResult,
    SessionUser,
    User,
} from "@/types";

import type {
    CanvassingRepository,
    DashboardRepository,
    ItemCreationRequestRepository,
    NotificationRepository,
    ReportRepository,
    SearchRepository,
    UserRepository,
} from "./interfaces";

/**
 * The aggregates the FastAPI backend does not implement.
 *
 * The dashboard, canvassing, reports, notifications, search and settings have
 * no upstream endpoints at all. Rather than fake them with demo data, every
 * **read** here answers with an empty payload — an empty list, a dashboard
 * whose panels are all empty, `null` for a single record. The UI already has an
 * empty state for each of those, so an unbuilt module renders as "nothing here
 * yet" rather than as an error, and no component has to know the difference.
 *
 * Empty is not the same as fabricated: nothing below invents a row, a total or
 * a name. So the **writes** still throw `NOT_IMPLEMENTED` (501) — each has to
 * return the record it claims to have stored, and answering with one would
 * report a save that never happened. That is the same treatment `submit`,
 * `recordProofOfOrder` and the canvassing writes get from the FastAPI
 * repositories themselves. None of them is reachable from a UI with nothing
 * listed in it, so what the user sees is the empty state either way.
 *
 * Composed into `Repositories` by `repository-factory.ts`; a module graduates
 * out of this file and into `./fastapi` as the backend grows the endpoint it
 * needs.
 */

function notImplemented(operation: string): never {
    throw ApiError.notImplemented(
        `${operation} is not supported by the backend yet.`,
    );
}

export class UnimplementedItemCreationRequestRepository
    implements ItemCreationRequestRepository
{
    list(): Promise<ItemCreationRequest[]> {
        return Promise.resolve([]);
    }
    create(): Promise<never> {
        return notImplemented("POST /item-creation-requests");
    }
}

export class UnimplementedCanvassingRepository implements CanvassingRepository {
    listCases(): Promise<CanvassingCase[]> {
        return Promise.resolve([]);
    }
    /**
     * `null` is the "no such case" answer the route turns into a 404, which the
     * detail view already renders as an empty panel rather than an error. With
     * no cases listed there is nothing to link to it anyway.
     */
    getDetail(): Promise<CanvassingDetail | null> {
        return Promise.resolve(null);
    }
    createBatch(): Promise<never> {
        return notImplemented("POST /canvassing/{id}/batches");
    }
    addQuote(): Promise<never> {
        return notImplemented("POST /canvassing/{id}/batches/{batch}/quotes");
    }
    selectVendor(): Promise<never> {
        return notImplemented(
            "POST /canvassing/{id}/batches/{batch}/select-vendor",
        );
    }
}

export class UnimplementedDashboardRepository implements DashboardRepository {
    get(): Promise<DashboardData> {
        return Promise.resolve({
            kpis: [],
            actionableRequests: [],
            recentActivity: [],
            pendingQuotations: [],
            upcomingDeadlines: [],
        });
    }
}

export class UnimplementedReportRepository implements ReportRepository {
    list(): Promise<ReportSummary[]> {
        return Promise.resolve([]);
    }
    /** No report is listed, so none can be picked; see `getDetail` above. */
    get(): Promise<ReportData | null> {
        return Promise.resolve(null);
    }
}

export class UnimplementedNotificationRepository
    implements NotificationRepository
{
    list(): Promise<Notification[]> {
        return Promise.resolve([]);
    }
    markRead(): Promise<never> {
        return notImplemented("PATCH /notifications/{id}/read");
    }
    /** Vacuously "all read" — there are no notifications to mark. */
    markAllRead(): Promise<Notification[]> {
        return Promise.resolve([]);
    }
}

export class UnimplementedSearchRepository implements SearchRepository {
    search(): Promise<SearchResult[]> {
        return Promise.resolve([]);
    }
}

export class UnimplementedUserRepository implements UserRepository {
    list(): Promise<User[]> {
        return Promise.resolve([]);
    }
    listRolePermissions(): Promise<RolePermission[]> {
        return Promise.resolve([]);
    }
    /**
     * The one read with no sensible empty value: the account form has fields,
     * not an empty state, and blanking them would read as "your profile was
     * wiped". The signed-in principal is already known — it is what
     * `/api/session` serves — so it is echoed back rather than invented.
     */
    getAccount(actor: Actor): Promise<SessionUser> {
        return Promise.resolve({ ...actor, avatar: "" });
    }
    updateAccount(): Promise<never> {
        return notImplemented("PATCH /settings/account");
    }
}

export function createUnimplementedRepositories() {
    return {
        itemCreationRequests: new UnimplementedItemCreationRequestRepository(),
        canvassing: new UnimplementedCanvassingRepository(),
        dashboard: new UnimplementedDashboardRepository(),
        reports: new UnimplementedReportRepository(),
        notifications: new UnimplementedNotificationRepository(),
        search: new UnimplementedSearchRepository(),
        users: new UnimplementedUserRepository(),
    };
}
