import type {
  ActionableRequest,
  ActivityEntry,
  Deadline,
  PendingQuotation,
} from "@/lib/types";

export const kpis = [
  { id: "pending-prs", value: 18, label: "Pending Purchase Requests" },
  { id: "your-action", value: 6, label: "Requiring Your Action" },
  { id: "pending-quotes", value: 9, label: "Pending Quotations" },
  { id: "partial-prs", value: 5, label: "Partially Completed PRs" },
  { id: "overdue", value: 4, label: "Overdue Deliveries" },
];

export const actionableRequests: ActionableRequest[] = [
  {
    id: "PR-2026-0114",
    requester: "M. Reyes",
    department: "Maintenance",
    amount: 84200,
    step: "PO Created — proof needed",
    stepTone: "ordered",
    priority: "high",
  },
  {
    id: "PR-2026-0115",
    requester: "A. Cruz",
    department: "Production",
    amount: 212000,
    step: "Canvassing — Batch 1",
    stepTone: "info",
    priority: "normal",
  },
  {
    id: "PR-2026-0116",
    requester: "R. Tan",
    department: "Quality",
    amount: 15750,
    step: "Comparison Ready — needs vendor selection",
    stepTone: "neutral",
    priority: "low",
  },
  {
    id: "PR-2026-0117",
    requester: "D. Lim",
    department: "Facilities",
    amount: 6300,
    step: "PO Created — proof needed",
    stepTone: "ordered",
    priority: "normal",
  },
  {
    id: "PR-2026-0113",
    requester: "Warehouse Team",
    department: "Warehouse",
    amount: 27800,
    step: "Comparison Ready — Batch 1",
    stepTone: "neutral",
    priority: "normal",
  },
  {
    id: "PR-2026-0112",
    requester: "M. Reyes",
    department: "Maintenance",
    amount: 11400,
    step: "Exemption Approval Needed",
    stepTone: "warning",
    priority: "high",
  },
];

export const recentActivity: ActivityEntry[] = [
  {
    id: "feed-1",
    description: "PO-3025 created for PR-2026-0114",
    timestamp: "10 minutes ago",
  },
  {
    id: "feed-2",
    description: "Vendor quotation received — Acme Industrial Supply",
    timestamp: "42 minutes ago",
  },
  {
    id: "feed-3",
    description: "PR-2026-0110 approved by Department Manager",
    timestamp: "2 hours ago",
  },
];

export const pendingQuotations: PendingQuotation[] = [
  {
    id: "PR-2026-0108",
    summary: "PR-2026-0108 · 3 vendors",
    detail: "2 of 3 quotes received",
  },
  {
    id: "PR-2026-0112",
    summary: "PR-2026-0112 · 1 vendor (exempted)",
    detail: "Awaiting single quote",
  },
  {
    id: "PR-2026-0113",
    summary: "PR-2026-0113 · 4 vendors",
    detail: "Comparison ready",
  },
];

export const upcomingDeadlines: Deadline[] = [
  { id: "dl-1", label: "PO-3018 delivery due", due: "Tomorrow" },
  { id: "dl-2", label: "Quote deadline — PR-2026-0113", due: "Jul 24" },
  { id: "dl-3", label: "PO-3009 delivery due", due: "Overdue", overdue: true },
];
