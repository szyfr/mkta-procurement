import type {
  PermissionModule,
  Role,
  RoleAssignee,
  RoleStatus,
  StatusTone,
} from "@/lib/types";

/**
 * Static catalogue behind Administration → Roles & Permissions.
 *
 * There is no roles endpoint on FastAPI yet — `/auth/me` returns a flat
 * permission list and nothing that describes a role — so the whole page reads
 * from here. Everything is shaped like the eventual API response so wiring it
 * up later is a swap of the source, not a rewrite of the screen.
 */

export const roleStatusLabels: Record<RoleStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const roleStatusTone: Record<RoleStatus, StatusTone> = {
  active: "success",
  inactive: "neutral",
};

/** 42 permissions across 10 modules. Keys are `module.action`. */
export const permissionModules: PermissionModule[] = [
  {
    key: "dashboard",
    name: "Dashboard",
    permissions: [
      { action: "view", label: "View dashboard" },
      { action: "export", label: "Export widgets" },
      { action: "kpi", label: "Configure KPI cards" },
    ],
  },
  {
    key: "pr",
    name: "Purchase requests",
    permissions: [
      { action: "view", label: "View requests" },
      { action: "create", label: "Create request" },
      { action: "edit", label: "Edit request" },
      { action: "approve", label: "Approve / reject" },
      { action: "bulk", label: "Bulk approve" },
      { action: "delete", label: "Delete request" },
    ],
  },
  {
    key: "canvass",
    name: "Canvassing",
    permissions: [
      { action: "view", label: "View canvass sheets" },
      { action: "quote", label: "Enter vendor quotes" },
      { action: "award", label: "Award line items" },
      { action: "override", label: "Override recommendation" },
      { action: "rules", label: "Edit sourcing rules" },
    ],
  },
  {
    key: "po",
    name: "Purchase orders",
    permissions: [
      { action: "view", label: "View orders" },
      { action: "create", label: "Create order" },
      { action: "send", label: "Send to vendor" },
      { action: "amend", label: "Amend order" },
      { action: "cancel", label: "Cancel order" },
    ],
  },
  {
    key: "vendors",
    name: "Vendors",
    permissions: [
      { action: "view", label: "View vendors" },
      { action: "create", label: "Add vendor" },
      { action: "accredit", label: "Accredit vendor" },
      { action: "blacklist", label: "Blacklist vendor" },
    ],
  },
  {
    key: "depts",
    name: "Departments",
    permissions: [
      { action: "view", label: "View departments" },
      { action: "manage", label: "Manage departments" },
      { action: "budget", label: "Set budget ceilings" },
    ],
  },
  {
    key: "users",
    name: "Users",
    permissions: [
      { action: "view", label: "View users" },
      { action: "invite", label: "Invite user" },
      { action: "edit", label: "Edit user" },
      { action: "deactivate", label: "Deactivate user" },
    ],
  },
  {
    key: "roles",
    name: "Roles",
    permissions: [
      { action: "view", label: "View roles" },
      { action: "create", label: "Create role" },
      { action: "edit", label: "Edit role" },
      { action: "delete", label: "Delete role" },
      { action: "assign", label: "Assign role to users" },
    ],
  },
  {
    key: "reports",
    name: "Reports",
    permissions: [
      { action: "view", label: "View reports" },
      { action: "export", label: "Export reports" },
      { action: "schedule", label: "Schedule reports" },
    ],
  },
  {
    key: "settings",
    name: "Settings",
    permissions: [
      { action: "view", label: "View settings" },
      { action: "edit", label: "Edit settings" },
      { action: "audit", label: "View audit log" },
      { action: "integrations", label: "Manage integrations" },
    ],
  },
];

export const totalPermissionCount = permissionModules.reduce(
  (total, module) => total + module.permissions.length,
  0,
);

/** Every key in a module, for the "all" grants below and the select-all rows. */
function allOf(moduleKey: string) {
  const module = permissionModules.find((entry) => entry.key === moduleKey);
  return (module?.permissions ?? []).map(
    (permission) => `${moduleKey}.${permission.action}`,
  );
}

function some(moduleKey: string, ...actions: string[]) {
  return actions.map((action) => `${moduleKey}.${action}`);
}

const everything = permissionModules.flatMap((module) => allOf(module.key));

/** `view` on every module — the Auditor's baseline. */
const viewEverywhere = permissionModules.map((module) => `${module.key}.view`);

function assignee(name: string, department: string): RoleAssignee {
  return { id: name.toLowerCase().replace(/[^a-z]+/g, "-"), name, department };
}

const danaRivera = assignee("Dana Rivera", "IT");
const graceTan = assignee("Grace Tan", "Procurement");

export const roles: Role[] = [
  {
    id: "r-1",
    name: "System Administrator",
    key: "system-administrator",
    description:
      "Unrestricted access to every module, including roles, users and settings.",
    isSystem: true,
    status: "active",
    assignees: [danaRivera, assignee("Marco Yu", "IT")],
    permissions: everything,
    createdAt: "Jan 04, 2026",
    createdBy: "Dana Rivera",
    updatedAt: "Aug 02, 2026",
    updatedBy: "Dana Rivera",
  },
  {
    id: "r-2",
    name: "Purchasing Head",
    key: "purchasing-head",
    description:
      "Owns sourcing policy — approves requests, awards canvassing and manages vendors.",
    isSystem: true,
    status: "active",
    assignees: [graceTan],
    permissions: [
      ...allOf("dashboard"),
      ...allOf("pr"),
      ...allOf("canvass"),
      ...allOf("po"),
      ...allOf("vendors"),
      ...some("depts", "view", "budget"),
      ...some("users", "view"),
      ...some("roles", "view"),
      ...allOf("reports"),
      ...some("settings", "view", "audit"),
    ],
    createdAt: "Jan 04, 2026",
    createdBy: "Dana Rivera",
    updatedAt: "Jul 28, 2026",
    updatedBy: "Dana Rivera",
  },
  {
    id: "r-3",
    name: "Sr. Purchasing Officer",
    key: "sr-purchasing-officer",
    description:
      "Handles day-to-day sourcing, can approve within threshold and override recommendations.",
    isSystem: false,
    status: "active",
    assignees: [danaRivera, assignee("Jomar Mercado", "Procurement")],
    permissions: [
      ...some("dashboard", "view", "export"),
      ...some("pr", "view", "create", "edit", "approve", "bulk"),
      ...some("canvass", "view", "quote", "award", "override"),
      ...some("po", "view", "create", "send", "amend"),
      ...some("vendors", "view", "create", "accredit"),
      ...some("depts", "view"),
      ...some("reports", "view", "export"),
    ],
    createdAt: "Feb 11, 2026",
    createdBy: "Dana Rivera",
    updatedAt: "Jul 30, 2026",
    updatedBy: "Grace Tan",
  },
  {
    id: "r-4",
    name: "Purchasing Officer",
    key: "purchasing-officer",
    description:
      "Prepares requests and canvass sheets; approvals are escalated to a senior officer.",
    isSystem: false,
    status: "active",
    assignees: [
      assignee("Rhea Villanueva", "Procurement"),
      assignee("Paolo Bautista", "Procurement"),
      assignee("Ivy Ocampo", "Procurement"),
      assignee("Nico Aguilar", "Procurement"),
    ],
    permissions: [
      ...some("dashboard", "view"),
      ...some("pr", "view", "create", "edit"),
      ...some("canvass", "view", "quote"),
      ...some("po", "view", "create"),
      ...some("vendors", "view"),
      ...some("reports", "view"),
    ],
    createdAt: "Feb 11, 2026",
    createdBy: "Dana Rivera",
    updatedAt: "Jul 22, 2026",
    updatedBy: "Grace Tan",
  },
  {
    id: "r-5",
    name: "Requester",
    key: "requester",
    description:
      "Raises purchase requests for their own department and tracks their status.",
    isSystem: true,
    status: "active",
    assignees: [
      assignee("Bea Soriano", "Production"),
      assignee("Karl Dizon", "Maintenance"),
      assignee("Mica Reyes", "Quality"),
      assignee("Jun Pascual", "Production"),
      assignee("Lara Mendoza", "Finance"),
      assignee("Toti Ramos", "Maintenance"),
      assignee("Ella Castillo", "Quality"),
      assignee("Dave Fernandez", "Production"),
      assignee("Rina Salas", "IT"),
      assignee("Ben Alcantara", "Warehouse"),
      assignee("Joy Panganiban", "Finance"),
      assignee("Migs Torres", "Production"),
    ],
    permissions: [
      ...some("dashboard", "view"),
      ...some("pr", "view", "create"),
      ...some("po", "view"),
    ],
    createdAt: "Jan 04, 2026",
    createdBy: "Dana Rivera",
    updatedAt: "Jun 18, 2026",
    updatedBy: "Dana Rivera",
  },
  {
    id: "r-6",
    name: "Warehouse Receiver",
    key: "warehouse-receiver",
    description:
      "Records deliveries against open orders and files goods receipt notes.",
    isSystem: false,
    status: "active",
    assignees: [
      assignee("Ariel Domingo", "Warehouse"),
      assignee("Tessa Buenaventura", "Warehouse"),
      assignee("Rey Lansangan", "Warehouse"),
    ],
    permissions: [
      ...some("dashboard", "view"),
      ...some("po", "view"),
      ...some("vendors", "view"),
      ...some("reports", "view"),
    ],
    createdAt: "Mar 03, 2026",
    createdBy: "Grace Tan",
    updatedAt: "Jul 12, 2026",
    updatedBy: "Grace Tan",
  },
  {
    id: "r-7",
    name: "Finance Reviewer",
    key: "finance-reviewer",
    description:
      "Reviews committed spend against budget ceilings before orders are released.",
    isSystem: false,
    status: "active",
    assignees: [
      assignee("Alvin Sy", "Finance"),
      assignee("Cheska Lao", "Finance"),
    ],
    permissions: [
      ...some("dashboard", "view", "export"),
      ...some("pr", "view", "approve"),
      ...some("po", "view"),
      ...some("depts", "view", "budget"),
      ...allOf("reports"),
      ...some("settings", "view", "audit"),
    ],
    createdAt: "Mar 20, 2026",
    createdBy: "Dana Rivera",
    updatedAt: "Jul 26, 2026",
    updatedBy: "Dana Rivera",
  },
  {
    id: "r-8",
    name: "Auditor",
    key: "auditor",
    description:
      "Read-only access across every module, plus the audit log. Cannot change records.",
    isSystem: false,
    status: "active",
    assignees: [assignee("Hector Lim", "Internal Audit")],
    // `view` everywhere, then the two extras that are still reads.
    permissions: [
      ...viewEverywhere,
      ...some("reports", "export"),
      ...some("settings", "audit"),
    ],
    createdAt: "Apr 08, 2026",
    createdBy: "Dana Rivera",
    updatedAt: "Jun 02, 2026",
    updatedBy: "Dana Rivera",
  },
  {
    id: "r-9",
    name: "Vendor Liaison",
    key: "vendor-liaison",
    description:
      "Draft role for the vendor onboarding pilot — accreditation only, no ordering rights.",
    isSystem: false,
    status: "inactive",
    assignees: [],
    permissions: [...some("vendors", "view", "create"), ...some("po", "view")],
    createdAt: "Jul 29, 2026",
    createdBy: "Grace Tan",
    updatedAt: "Aug 01, 2026",
    updatedBy: "Grace Tan",
  },
];

/** How many of a module's permissions a grant set covers. */
export function moduleGrantCount(
  permissions: Iterable<string>,
  moduleKey: string,
) {
  const granted = new Set(permissions);
  return allOf(moduleKey).filter((key) => granted.has(key)).length;
}

/** Modules with at least one grant — the "across N modules" counter. */
export function grantedModuleCount(permissions: Iterable<string>) {
  const granted = new Set(permissions);
  return permissionModules.filter((module) =>
    module.permissions.some((permission) =>
      granted.has(`${module.key}.${permission.action}`),
    ),
  ).length;
}

/** Two-letter monogram for the avatar stacks. */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""}`.toUpperCase();
}
