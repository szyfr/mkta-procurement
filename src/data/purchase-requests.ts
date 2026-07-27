import type {
  ItemCreationRequest,
  PurchaseRequest,
  PurchaseRequestStatus,
  StatusTone,
} from "@/lib/types";

/** Status → pill tone. Single source of truth for how a status looks. */
export const purchaseRequestTone: Record<PurchaseRequestStatus, StatusTone> = {
  draft: "neutral",
  canvassing: "info",
  "po-created": "ordered",
  "partially-completed": "partial",
  completed: "success",
  rejected: "danger",
};

/** Legend shown above the purchase request list. */
export const statusLegend: { label: string; status: PurchaseRequestStatus }[] =
  [
    { label: "Draft", status: "draft" },
    { label: "Canvassing", status: "canvassing" },
    { label: "PO Created", status: "po-created" },
    { label: "Partially Completed", status: "partially-completed" },
    { label: "Completed", status: "completed" },
    { label: "Rejected", status: "rejected" },
  ];

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: "PR-2026-0114",
    title: "Maintenance shop consumables",
    autoTitle: true,
    requester: "M. Reyes",
    department: "Maintenance",
    amount: 84200,
    priority: "High",
    status: "po-created",
    statusLabel: "PO-3025 Created",
    createdAt: "Jul 20",
    submittedOn: "Jul 18",
    items: [
      {
        id: "PR-2026-0114-1",
        name: "Cutting discs, 4in",
        quantity: 40,
        unit: "pcs",
        estimatedUnitCost: 180,
        vendor: "Acme Industrial Supply",
        sourcing: "direct",
        status: "po-created",
      },
      {
        id: "PR-2026-0114-2",
        name: "Shop rags, bulk pack",
        quantity: 20,
        unit: "pack",
        estimatedUnitCost: 340,
        vendor: "Acme Industrial Supply",
        sourcing: "direct",
        status: "po-created",
      },
    ],
    documents: [
      { id: "doc-0114-1", name: "PO-3025.pdf", date: "Jul 20" },
      {
        id: "doc-0114-2",
        name: "Acme Industrial Supply — Quotation.pdf",
        date: "Jul 18",
      },
    ],
    activity: [
      { id: "act-0114-1", description: "PO-3025 created", timestamp: "Jul 20" },
      {
        id: "act-0114-2",
        description: "Submitted by M. Reyes",
        timestamp: "Jul 18",
      },
    ],
    actionPanelNote:
      "A purchase order exists for every item. Add proof of order and confirm delivery to complete this request.",
  },
  {
    id: "PR-2026-0115",
    title: "Q3 production line lubricants",
    requester: "A. Cruz",
    department: "Production",
    amount: 212000,
    priority: "Normal",
    status: "canvassing",
    statusLabel: "Canvassing · 2/3 items",
    createdAt: "Jul 18",
    submittedOn: "Jul 16",
    items: [
      {
        id: "PR-2026-0115-1",
        name: "Industrial gear oil 20L",
        quantity: 10,
        unit: "drum",
        estimatedUnitCost: 3200,
        vendor: null,
        sourcing: "canvassing",
        status: "canvassing",
        batch: 1,
      },
    ],
    activity: [
      {
        id: "act-0115-1",
        description: "Industrial gear oil 20L routed to canvassing (Batch 1)",
        timestamp: "Jul 17",
      },
      {
        id: "act-0115-2",
        description: "Submitted by A. Cruz",
        timestamp: "Jul 16",
      },
    ],
    actionPanelNote:
      "Waiting on vendor quotes. 2 of 3 minimum quotes received for Batch 1.",
  },
  {
    id: "PR-2026-0117",
    title: "Facilities electrical fixtures",
    requester: "D. Lim",
    department: "Facilities",
    amount: 6300,
    priority: "Normal",
    status: "partially-completed",
    statusLabel: "Partially Completed — 2/4 items",
    createdAt: "Jul 15",
    submittedOn: "Jul 15",
    items: [
      {
        id: "PR-2026-0117-1",
        name: "LED light fixtures",
        quantity: 12,
        unit: "pcs",
        estimatedUnitCost: 210,
        vendor: "Bay Area Electricals",
        sourcing: "direct",
        status: "po-created",
      },
      {
        id: "PR-2026-0117-2",
        name: "Circuit breaker panel",
        quantity: 1,
        unit: "unit",
        estimatedUnitCost: 1800,
        vendor: "Bay Area Electricals",
        sourcing: "direct",
        status: "delivered",
        deliveredOn: "Jul 20",
      },
      {
        id: "PR-2026-0117-3",
        name: "Cable conduit pipes",
        quantity: 30,
        unit: "pcs",
        estimatedUnitCost: 45,
        vendor: "Bay Area Electricals",
        sourcing: "direct",
        status: "delivered",
        deliveredOn: "Jul 20",
      },
      {
        id: "PR-2026-0117-4",
        name: "Junction boxes",
        quantity: 15,
        unit: "pcs",
        estimatedUnitCost: 65,
        vendor: null,
        sourcing: "canvassing",
        status: "canvassing",
        batch: 1,
      },
    ],
    documents: [
      {
        id: "doc-0117-1",
        name: "Bay Area Electricals — Invoice INV-4471.pdf",
        date: "Jul 20",
      },
      {
        id: "doc-0117-2",
        name: "Bay Area Electricals — Quotation.pdf",
        date: "Jul 15",
      },
    ],
    comments: [
      {
        id: "cmt-0117-1",
        author: "M. Reyes",
        body: "Junction boxes are lower priority — fine to wait for full canvassing.",
        timestamp: "Jul 16",
      },
    ],
    activity: [
      {
        id: "act-0117-1",
        description:
          "Circuit breaker panel & Cable conduit pipes marked delivered",
        timestamp: "Jul 20",
      },
      {
        id: "act-0117-2",
        description: "PO created for LED light fixtures & 2 others",
        timestamp: "Jul 19",
      },
      {
        id: "act-0117-3",
        description: "Junction boxes routed to canvassing (Batch 1)",
        timestamp: "Jul 17",
      },
      {
        id: "act-0117-4",
        description: "Submitted by D. Lim",
        timestamp: "Jul 15",
      },
    ],
    actionPanelNote:
      "3 of 4 items are sourced. Waiting on Junction boxes canvassing to fully complete this PR.",
  },
  {
    id: "PR-2026-0118",
    title: null,
    requester: "You",
    department: "IT",
    amount: 3150,
    priority: "Low",
    status: "draft",
    statusLabel: "Draft",
    createdAt: null,
    items: [
      {
        id: "PR-2026-0118-1",
        name: "Laptop docking station",
        quantity: 3,
        unit: "pcs",
        estimatedUnitCost: 850,
        vendor: null,
        sourcing: "canvassing",
        status: "pending",
      },
      {
        id: "PR-2026-0118-2",
        name: "USB-C cables, 2m",
        quantity: 10,
        unit: "pcs",
        estimatedUnitCost: 60,
        vendor: null,
        sourcing: "canvassing",
        status: "pending",
      },
    ],
  },
  {
    id: "PR-2026-0109",
    title: "Quality lab duplicate order",
    autoTitle: true,
    requester: "R. Tan",
    department: "Quality",
    amount: 48900,
    priority: "Normal",
    status: "rejected",
    statusLabel: "Rejected",
    createdAt: "Jul 10",
    submittedOn: "Jul 8",
    rejectedOn: "Jul 10",
    rejectionReason:
      "Duplicate of an active PR (PR-2026-0104) already covering the same hydraulic fitting for Quality — consolidate instead of resubmitting separately.",
    items: [
      {
        id: "PR-2026-0109-1",
        name: "Hydraulic fitting, 3/8in NPT",
        quantity: 24,
        unit: "pcs",
        estimatedUnitCost: 2037,
        vendor: null,
        sourcing: "canvassing",
        status: "pending",
      },
    ],
  },
  {
    id: "PR-2026-0101",
    title: "Production line replacement parts",
    requester: "A. Cruz",
    department: "Production",
    amount: 156400,
    priority: "Normal",
    status: "completed",
    statusLabel: "Completed",
    createdAt: "Jul 2",
    submittedOn: "Jun 28",
    completedOn: "Jul 2",
    items: [
      {
        id: "PR-2026-0101-1",
        name: "Conveyor belt roller, 4in",
        quantity: 8,
        unit: "pcs",
        estimatedUnitCost: 12400,
        vendor: "Acme Industrial Supply",
        sourcing: "direct",
        status: "delivered",
        deliveredOn: "Jul 2",
      },
      {
        id: "PR-2026-0101-2",
        name: "Drive chain, 40-pitch",
        quantity: 6,
        unit: "pcs",
        estimatedUnitCost: 9450,
        vendor: "Acme Industrial Supply",
        sourcing: "direct",
        status: "delivered",
        deliveredOn: "Jul 2",
      },
    ],
    documents: [
      { id: "doc-0101-1", name: "PO-3011.pdf", date: "Jun 30" },
      {
        id: "doc-0101-2",
        name: "Acme Industrial Supply — Invoice INV-4302.pdf",
        date: "Jul 2",
      },
    ],
    activity: [
      {
        id: "act-0101-1",
        description: "All items marked delivered",
        timestamp: "Jul 2",
      },
      {
        id: "act-0101-2",
        description: "PO-3011 created for Acme Industrial Supply",
        timestamp: "Jun 30",
      },
      {
        id: "act-0101-3",
        description: "Submitted by A. Cruz",
        timestamp: "Jun 28",
      },
    ],
  },
  {
    id: "PR-2026-0108",
    title: "Safety gloves restock",
    autoTitle: true,
    requester: "HR / Facilities",
    department: "HR / Facilities",
    amount: 9400,
    priority: "Normal",
    status: "po-created",
    statusLabel: "PO Created",
    createdAt: "Jul 8",
    submittedOn: "Jul 6",
    items: [
      {
        id: "PR-2026-0108-1",
        name: "Safety gloves, various sizes",
        quantity: 60,
        unit: "pairs",
        estimatedUnitCost: 157,
        vendor: "Sunrise Safety Equipment",
        sourcing: "canvassing",
        status: "po-created",
        batch: 1,
      },
    ],
    activity: [
      {
        id: "act-0108-1",
        description: "Vendor selected — Sunrise Safety Equipment",
        timestamp: "Jul 8",
      },
      {
        id: "act-0108-2",
        description: "Submitted by HR / Facilities",
        timestamp: "Jul 6",
      },
    ],
    actionPanelNote:
      "A purchase order exists for every item. Add proof of order and confirm delivery to complete this request.",
  },
  {
    id: "PR-2026-0113",
    title: "Warehouse palletising supplies",
    autoTitle: true,
    requester: "Warehouse Team",
    department: "Warehouse",
    amount: 27800,
    priority: "Normal",
    status: "canvassing",
    statusLabel: "Comparison Ready — Batch 1",
    createdAt: "Jul 14",
    submittedOn: "Jul 12",
    items: [
      {
        id: "PR-2026-0113-1",
        name: "Steel drum pallets (48in)",
        quantity: 6,
        unit: "pcs",
        estimatedUnitCost: 1900,
        vendor: null,
        sourcing: "canvassing",
        status: "canvassing",
        batch: 1,
      },
      {
        id: "PR-2026-0113-2",
        name: "Stretch wrap film",
        quantity: 40,
        unit: "rolls",
        estimatedUnitCost: 180,
        vendor: null,
        sourcing: "canvassing",
        status: "canvassing",
        batch: 1,
      },
      {
        id: "PR-2026-0113-3",
        name: "Corner edge protectors",
        quantity: 200,
        unit: "pcs",
        estimatedUnitCost: 47,
        vendor: "Pacific Fasteners Inc.",
        sourcing: "canvassing",
        status: "po-created",
        batch: 2,
      },
      {
        id: "PR-2026-0113-4",
        name: "Pallet wrap dispenser (handheld)",
        quantity: 3,
        unit: "pcs",
        estimatedUnitCost: 1200,
        vendor: null,
        sourcing: "canvassing",
        status: "awaiting-batch",
      },
    ],
    actionPanelNote:
      "Batch 1 has all its quotes and is ready for vendor selection. One item is still awaiting batch assignment.",
  },
  {
    id: "PR-2026-0112",
    title: "Maintenance bearing replacement",
    autoTitle: true,
    requester: "M. Reyes",
    department: "Maintenance",
    amount: 11400,
    priority: "High",
    status: "canvassing",
    statusLabel: "Exemption Approval Needed",
    createdAt: "Jul 12",
    submittedOn: "Jul 11",
    items: [
      {
        id: "PR-2026-0112-1",
        name: "Replacement bearing set (OEM)",
        quantity: 2,
        unit: "set",
        estimatedUnitCost: 5700,
        vendor: null,
        sourcing: "canvassing",
        status: "canvassing",
        batch: 1,
      },
    ],
    actionPanelNote:
      "This item is sole-source. The 3-quote minimum needs an exemption approval before a PO can be created.",
  },
  {
    id: "PR-2026-0116",
    title: "Quality lab consumables",
    autoTitle: true,
    requester: "R. Tan",
    department: "Quality",
    amount: 15750,
    priority: "Low",
    status: "canvassing",
    statusLabel: "Comparison Ready — needs vendor selection",
    createdAt: "Jul 16",
    submittedOn: "Jul 14",
    items: [
      {
        id: "PR-2026-0116-1",
        name: "Calibration reference weights",
        quantity: 1,
        unit: "set",
        estimatedUnitCost: 15750,
        vendor: null,
        sourcing: "canvassing",
        status: "canvassing",
        batch: 1,
      },
    ],
    actionPanelNote:
      "All quotes are in. Select a vendor to move this request to PO creation.",
  },
];

/** The six requests shown on the list pages, in wireframe order. */
export const listedPurchaseRequestIds = [
  "PR-2026-0114",
  "PR-2026-0115",
  "PR-2026-0118",
  "PR-2026-0109",
  "PR-2026-0117",
  "PR-2026-0101",
];

export const purchaseRequestListTotal = 18;

export function getPurchaseRequest(id: string) {
  return purchaseRequests.find((request) => request.id === id);
}

export function getListedPurchaseRequests() {
  return listedPurchaseRequestIds
    .map((id) => getPurchaseRequest(id))
    .filter((request): request is PurchaseRequest => request !== undefined);
}

export const itemCreationRequests: ItemCreationRequest[] = [
  {
    id: "ICR-0031",
    itemName: "Junction boxes, 4x4 weatherproof",
    requestedFor: "PR-2026-0117",
    requestedBy: "D. Lim",
    status: "pending",
    statusLabel: "Pending Review",
    submittedOn: "Jul 15",
  },
  {
    id: "ICR-0030",
    itemName: "Non-slip anti-fatigue mat, 3x5ft",
    requestedFor: null,
    requestedBy: "R. Tan",
    status: "approved",
    statusLabel: "Approved",
    submittedOn: "Jul 9",
  },
  {
    id: "ICR-0028",
    itemName: "Hydraulic fitting, 3/8in NPT",
    requestedFor: "PR-2026-0110",
    requestedBy: "A. Cruz",
    status: "rejected",
    statusLabel: "Rejected — duplicate of existing SKU",
    submittedOn: "Jul 5",
  },
];

export const itemCreationRequestTone: Record<
  ItemCreationRequest["status"],
  StatusTone
> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

/** Departments offered when creating a request. */
export const departments = [
  "Production",
  "Maintenance",
  "Facilities",
  "Quality",
  "Warehouse",
  "IT",
  "HR / Facilities",
];

/** Catalog items offered in the line item picker. */
export const catalogItems = [
  { name: "Hex bolt M8x40 (galvanized)", unit: "pcs", unitCost: 4.5 },
  { name: "Industrial gear oil 20L", unit: "drum", unitCost: 3200 },
  { name: "Stretch wrap film", unit: "rolls", unitCost: 180 },
  { name: "Steel drum pallets (48in)", unit: "pcs", unitCost: 1900 },
  { name: "LED light fixtures", unit: "pcs", unitCost: 210 },
  { name: "Safety gloves, various sizes", unit: "pairs", unitCost: 157 },
];

export const vendors = [
  "Acme Industrial Supply",
  "Pacific Fasteners Inc.",
  "Del Rosario Trading",
  "Metro Lubricants Corp",
  "Bay Area Electricals",
  "Sunrise Safety Equipment",
];

export const paymentTerms = [
  "Cash on delivery",
  "Net 15",
  "Net 30",
  "Net 60",
  "50% down payment",
];
