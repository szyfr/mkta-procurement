import type {
    Actor,
    CatalogItemPage,
    CreateItemCreationRequestInput,
    DashboardData,
    ItemCreationRequest,
    Notification,
    ReportData,
    ReportFilters,
    ReportSummary,
    RolePermission,
    SearchResult,
    SessionUser,
    UpdateAccountInput,
    User,
} from "@/types";

export interface DashboardRepository {
    get(actor: Actor): Promise<DashboardData>;
}

export interface ItemCreationRequestRepository {
    list(): Promise<ItemCreationRequest[]>;
    create(
        input: CreateItemCreationRequestInput,
        actor: Actor,
    ): Promise<ItemCreationRequest>;
}

export interface ReportRepository {
    list(): Promise<ReportSummary[]>;
    /**
     * Filters are accepted and echoed into the result heading. The seeded reports
     * are canned, pre-formatted payloads rather than aggregates, so narrowing the
     * range cannot recompute the rows.
     */
    get(id: string, filters: ReportFilters): Promise<ReportData | null>;
}

export interface NotificationRepository {
    list(actor: Actor): Promise<Notification[]>;
    markRead(id: string, actor: Actor): Promise<Notification>;
    markAllRead(actor: Actor): Promise<Notification[]>;
}

export interface SearchRepository {
    search(query: string): Promise<SearchResult[]>;
}

export interface UserRepository {
    list(): Promise<User[]>;
    listRolePermissions(): Promise<RolePermission[]>;
    getAccount(actor: Actor): Promise<SessionUser>;
    updateAccount(
        input: UpdateAccountInput,
        actor: Actor,
    ): Promise<SessionUser>;
}

/** Master data backing the pickers: departments, vendors, catalog, terms. */
export interface ReferenceRepository {
    listDepartments(): Promise<string[]>;
    listVendors(): Promise<string[]>;
    listPaymentTerms(): Promise<string[]>;
    /**
     * Paged, unlike the other three: the catalog is large enough that the picker
     * loads it a page at a time as the user scrolls.
     */
    listCatalogItems(page: number, pageSize: number): Promise<CatalogItemPage>;
}
