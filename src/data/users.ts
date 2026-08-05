import type { RolePermission, StatusTone, User, UserStatus } from "@/lib/types";

// The mock signed-in user is gone: the sidebar footer and the My Account panel
// now read the real one from `/auth/me`. The list below still backs the
// Settings → Users table, which has no backend endpoint yet.

export const userStatusTone: Record<UserStatus, StatusTone> = {
  active: "success",
  invited: "warning",
};

export const users: User[] = [
  {
    id: "u-1",
    name: "S. Galvis",
    role: "Procurement Officer",
    department: "Procurement",
    status: "active",
    isCurrentUser: true,
  },
  {
    id: "u-2",
    name: "M. Reyes",
    role: "Department Manager",
    department: "Maintenance",
    status: "active",
  },
  {
    id: "u-3",
    name: "A. Cruz",
    role: "Employee / Requester",
    department: "Production",
    status: "active",
  },
  {
    id: "u-4",
    name: "R. Tan",
    role: "Employee / Requester",
    department: "Quality",
    status: "invited",
  },
];

export const rolePermissions: RolePermission[] = [
  {
    role: "Procurement Officer",
    description: "Full access to PRs, canvassing, POs, evaluations, reports",
  },
  {
    role: "Department Manager",
    description: "Approve PRs for their department; view-only elsewhere",
  },
  {
    role: "Administrator",
    description: "Manage users, roles, and settings; no procurement actions",
  },
  {
    role: "Employee / Requester",
    description: "Create and track own PRs and Item Creation Requests",
  },
];
