import type { RolePermission, User } from "@/lib/types";

/**
 * Seed fixtures. Read only by `src/db/seed.ts`; the signed-in user reaches the
 * app through `/api/session`. The status tone map moved to
 * `@/lib/status-tones`.
 */

/** Merged with `users[0]` on seed — they describe the same person. */
export const currentUser = {
  name: "S. Galvis",
  email: "s.galvis@mkthemedattractions.com.ph",
  role: "Procurement Officer",
  department: "Procurement",
  avatar: "",
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
