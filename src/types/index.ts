/**
 * The DTO contract shared by the BFF, the repositories and the React app.
 *
 * The domain interfaces in `@/lib/types` are the contract: the REST API returns
 * exactly these shapes, which is why the presentational components did not have
 * to change when the data moved behind an API. Any future FastAPI
 * implementation has to satisfy the same shapes.
 */
export type * from "@/lib/types";
export type * from "./api";
export type * from "./reports";

/** The dashboard payload, assembled by a single endpoint. */
export interface DashboardData {
    kpis: { id: string; value: number; label: string }[];
    actionableRequests: import("@/lib/types").ActionableRequest[];
    recentActivity: import("@/lib/types").ActivityEntry[];
    pendingQuotations: import("@/lib/types").PendingQuotation[];
    upcomingDeadlines: import("@/lib/types").Deadline[];
}

/** The signed-in user as exposed to the client. Never includes a token. */
export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    avatar: string;
}
