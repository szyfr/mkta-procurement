import {
  ChartColumnIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react";

export const appIdentity = {
  name: "Procurement",
  organization: "Northfield Manufacturing Corp.",
};

export const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
  {
    title: "Purchase Requests",
    url: "/purchase-requests",
    icon: ClipboardListIcon,
  },
  { title: "Canvassing", url: "/canvassing", icon: UsersIcon },
  { title: "Reports", url: "/reports", icon: ChartColumnIcon },
];

/** Pinned to the sidebar footer, separate from the main nav. */
export const secondaryNav = [
  { title: "Settings", url: "/settings/account", icon: Settings2Icon },
];

export const settingsNav = [
  { title: "My Account", url: "/settings/account" },
  { title: "Users & Roles", url: "/settings/users", adminOnly: true },
];

/**
 * Breadcrumb labels for static segments. Segments without an entry — dynamic
 * ids such as `PR-2026-0117` — render as-is.
 */
export const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  "purchase-requests": "Purchase Requests",
  new: "New",
  "item-requests": "Item Creation Requests",
  canvassing: "Canvassing",
  quotes: "Quotes",
  reports: "Reports",
  settings: "Settings",
  account: "My Account",
  users: "Users & Roles",
};

/** Segments that exist only to nest routes and should not appear as a crumb. */
export const hiddenBreadcrumbSegments = new Set(["quotes"]);
