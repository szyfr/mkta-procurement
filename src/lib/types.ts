/**
 * Types for the screens that are still mock-driven — dashboard, reports,
 * roles, users, notifications and global search — plus the one presentation
 * vocabulary every screen shares.
 *
 * Purchase requests, canvassing and the rest of the backend-wired features do
 * not appear here: their shapes are the FastAPI responses themselves and live
 * in each module's `models/`.
 */

/** Visual tone shared by every status pill in the app. */
export type StatusTone =
  | "neutral"
  | "info"
  | "ordered"
  | "partial"
  | "success"
  | "warning"
  | "danger";

/**
 * The backend's own priority values, kept here rather than in the purchase
 * requests module because `PriorityBadge` is shared and a shared component may
 * not reach into a feature module for its types. Modules re-export it.
 */
export type Priority = "low" | "normal" | "high";

export interface ActivityEntry {
  id: string;
  description: string;
  timestamp: string;
}

/** A row on the dashboard's "Requests Requiring Action" table. Mock-driven. */
export interface ActionableRequest {
  id: string;
  requester: string;
  department: string;
  amount: number;
  step: string;
  stepTone: StatusTone;
  priority: Priority;
}

export interface PendingQuotation {
  id: string;
  summary: string;
  detail: string;
}

export interface Deadline {
  id: string;
  label: string;
  due: string;
  overdue?: boolean;
}

/**
 * Canvassing's wireframe types are gone: batches, quote minimums and exemption
 * flags described a model the backend never grew, and the screens that used
 * them now read `modules/canvassing` instead.
 */

export type NotificationGroup = "today" | "earlier";

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  group: NotificationGroup;
  read: boolean;
  href: string;
}

export type SearchResultType =
  | "Purchase Requests"
  | "Purchase Orders"
  | "Items"
  | "Vendors";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  label: string;
  detail: string;
  badge?: string;
  badgeTone?: StatusTone;
  href: string;
}

export type UserStatus = "active" | "invited";

export interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  status: UserStatus;
  /** True for the signed-in user, who cannot edit their own row here. */
  isCurrentUser?: boolean;
}

export interface RolePermission {
  role: string;
  description: string;
}

/**
 * Roles & Permissions. No backend endpoint exists for any of this yet — the
 * catalogue below is the shape the page would read once one does, and
 * `src/data/roles.ts` supplies it statically in the meantime.
 */

export type RoleStatus = "active" | "inactive";

/** A single grantable action, addressed as `module.action` everywhere else. */
export interface Permission {
  action: string;
  label: string;
}

export interface PermissionModule {
  key: string;
  name: string;
  permissions: Permission[];
}

/** A person holding a role. Department is shown beside the name in the sheet. */
export interface RoleAssignee {
  id: string;
  name: string;
  department: string;
}

export interface Role {
  id: string;
  name: string;
  /** Stable slug shown in mono under the role name. */
  key: string;
  description: string;
  /** System roles ship with the product: they cannot be deleted. */
  isSystem: boolean;
  status: RoleStatus;
  assignees: RoleAssignee[];
  /** Grant keys, `module.action`. */
  permissions: string[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
