import {
  Building2Icon,
  ChartColumnIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  TruckIcon,
  UsersIcon,
} from "lucide-react";

export const appIdentity = {
  name: "Procurement",
  organization: "MK Themed Attractions Phils.",
};

export const mainNav = [
  {
    title: "Procurement",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
      {
        title: "Purchase Requests",
        url: "/purchase-requests",
        icon: ClipboardListIcon,
      },
      { title: "Canvassing", url: "/canvassing", icon: UsersIcon },
      { title: "Reports", url: "/reports", icon: ChartColumnIcon },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Departments", url: "/departments", icon: Building2Icon },
      { title: "Vendors", url: "/vendors", icon: TruckIcon },
    ],
  },
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
  departments: "Departments",
  vendors: "Vendors",
  settings: "Settings",
  account: "My Account",
  users: "Users & Roles",
};

/** Segments that exist only to nest routes and should not appear as a crumb. */
export const hiddenBreadcrumbSegments = new Set(["quotes"]);
