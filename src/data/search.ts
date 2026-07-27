import type { SearchResult, SearchResultType } from "@/lib/types";

/** Order the result groups appear in the dropdown. */
export const searchResultGroups: SearchResultType[] = [
  "Purchase Requests",
  "Purchase Orders",
  "Items",
  "Vendors",
];

export const searchIndex: SearchResult[] = [
  {
    id: "PR-2026-0115",
    type: "Purchase Requests",
    label: "PR-2026-0115",
    detail: "Industrial gear oil 20L",
    badge: "Canvassing",
    badgeTone: "info",
    href: "/purchase-requests/PR-2026-0115",
  },
  {
    id: "PR-2026-0114",
    type: "Purchase Requests",
    label: "PR-2026-0114",
    detail: "Maintenance shop consumables",
    badge: "PO Created",
    badgeTone: "ordered",
    href: "/purchase-requests/PR-2026-0114",
  },
  {
    id: "PR-2026-0117",
    type: "Purchase Requests",
    label: "PR-2026-0117",
    detail: "Facilities electrical fixtures",
    badge: "Partially Completed",
    badgeTone: "partial",
    href: "/purchase-requests/PR-2026-0117",
  },
  {
    id: "PO-3021",
    type: "Purchase Orders",
    label: "PO-3021",
    detail: "Metro Lubricants Corp",
    badge: "Open",
    badgeTone: "neutral",
    href: "/purchase-requests/PR-2026-0115",
  },
  {
    id: "PO-3025",
    type: "Purchase Orders",
    label: "PO-3025",
    detail: "Acme Industrial Supply",
    badge: "Open",
    badgeTone: "neutral",
    href: "/purchase-requests/PR-2026-0114",
  },
  {
    id: "item-gear-oil-20",
    type: "Items",
    label: "Industrial gear oil 20L",
    detail: "Lubricants & Fluids",
    href: "/purchase-requests",
  },
  {
    id: "item-gear-oil-5",
    type: "Items",
    label: "Industrial gear oil 5L",
    detail: "Lubricants & Fluids",
    href: "/purchase-requests",
  },
  {
    id: "item-stretch-wrap",
    type: "Items",
    label: "Stretch wrap film",
    detail: "Packaging",
    href: "/purchase-requests",
  },
  {
    id: "vendor-metro",
    type: "Vendors",
    label: "Metro Lubricants Corp",
    detail: "4.5 / 5 · 14 POs fulfilled",
    href: "/reports",
  },
  {
    id: "vendor-acme",
    type: "Vendors",
    label: "Acme Industrial Supply",
    detail: "4.1 / 5 · 21 POs fulfilled",
    href: "/reports",
  },
];

/** Max results shown per group before the "see all" row takes over. */
export const maxResultsPerGroup = 3;

/**
 * Naive substring match across label and detail. Stands in for a real search
 * endpoint — swap the body without changing the caller.
 */
export function searchProcurement(query: string): SearchResult[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  return searchIndex.filter(
    (result) =>
      result.label.toLowerCase().includes(term) ||
      result.detail.toLowerCase().includes(term),
  );
}
