import type { Notification } from "@/lib/types";

export const notifications: Notification[] = [
  {
    id: "n-1",
    message: "PR-2026-0114 needs your review",
    timestamp: "10 minutes ago",
    group: "today",
    read: false,
    href: "/purchase-requests/PR-2026-0114",
  },
  {
    id: "n-2",
    message: "Del Rosario Trading submitted a quote for PR-2026-0115",
    timestamp: "42 minutes ago",
    group: "today",
    read: false,
    href: "/purchase-requests/PR-2026-0115",
  },
  {
    id: "n-3",
    message: "PO-3025 created",
    timestamp: "2 hours ago",
    group: "today",
    read: true,
    href: "/purchase-requests/PR-2026-0114",
  },
  {
    id: "n-4",
    message: "PR-2026-0110 approved by Department Manager",
    timestamp: "Yesterday",
    group: "earlier",
    read: true,
    href: "/purchase-requests",
  },
  {
    id: "n-5",
    message: "PO-3009 delivery is overdue",
    timestamp: "2 days ago",
    group: "earlier",
    read: true,
    href: "/purchase-requests",
  },
];
