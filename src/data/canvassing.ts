import type {
  CanvassingCase,
  CanvassingDetail,
  CanvassingStatus,
  StatusTone,
} from "@/lib/types";

export const canvassingTone: Record<CanvassingStatus, StatusTone> = {
  "awaiting-quotes": "info",
  "comparison-ready": "neutral",
  "vendor-selected": "success",
  "pending-exemption": "warning",
};

export const canvassingCases: CanvassingCase[] = [
  {
    id: "cv-0115-1",
    purchaseRequestId: "PR-2026-0115",
    item: "Industrial gear oil 20L",
    batch: 1,
    department: "Production",
    quotesReceived: 2,
    quotesRequired: 3,
    status: "awaiting-quotes",
    statusLabel: "Awaiting Quotes",
    initiatedOn: "Jul 17",
  },
  {
    id: "cv-0113-1",
    purchaseRequestId: "PR-2026-0113",
    item: "Steel drum pallets (48in)",
    batch: 1,
    department: "Warehouse",
    quotesReceived: 4,
    quotesRequired: 3,
    status: "comparison-ready",
    statusLabel: "Comparison Ready",
    initiatedOn: "Jul 14",
  },
  {
    id: "cv-0113-2",
    purchaseRequestId: "PR-2026-0113",
    item: "Stretch wrap film",
    batch: 1,
    department: "Warehouse",
    quotesReceived: 4,
    quotesRequired: 3,
    status: "comparison-ready",
    statusLabel: "Comparison Ready",
    initiatedOn: "Jul 14",
  },
  {
    id: "cv-0113-3",
    purchaseRequestId: "PR-2026-0113",
    item: "Corner edge protectors",
    batch: 2,
    department: "Warehouse",
    quotesReceived: 3,
    quotesRequired: 3,
    status: "vendor-selected",
    statusLabel: "Vendor Selected",
    initiatedOn: "Jul 15",
  },
  {
    id: "cv-0112-1",
    purchaseRequestId: "PR-2026-0112",
    item: "Replacement bearing set (OEM)",
    batch: 1,
    department: "Maintenance",
    quotesReceived: 1,
    quotesRequired: 1,
    exempted: true,
    status: "pending-exemption",
    statusLabel: "Pending Exemption Approval",
    initiatedOn: "Jul 12",
  },
  {
    id: "cv-0108-1",
    purchaseRequestId: "PR-2026-0108",
    item: "Safety gloves, various sizes",
    batch: 1,
    department: "HR / Facilities",
    quotesReceived: 3,
    quotesRequired: 3,
    status: "vendor-selected",
    statusLabel: "Vendor Selected",
    initiatedOn: "Jul 8",
  },
];

/**
 * Explains why one PR appears as several rows — items awarded to different
 * vendors are canvassed as separate batches.
 */
export const canvassingListNote =
  "PR-2026-0113 shows two batches — items awarded to different vendors within the same PR appear as separate rows, grouped visually by shared shading, each tagged with its batch number.";

export const canvassingDetails: CanvassingDetail[] = [
  {
    purchaseRequestId: "PR-2026-0113",
    department: "Warehouse",
    items: [
      {
        id: "PR-2026-0113-1",
        name: "Steel drum pallets (48in)",
        quantity: 6,
        batch: 1,
        status: "Comparison Ready",
        statusTone: "neutral",
      },
      {
        id: "PR-2026-0113-2",
        name: "Stretch wrap film",
        quantity: 40,
        batch: 1,
        status: "Comparison Ready",
        statusTone: "neutral",
      },
      {
        id: "PR-2026-0113-3",
        name: "Corner edge protectors",
        quantity: 200,
        batch: 2,
        status: "Vendor Selected",
        statusTone: "success",
      },
      {
        id: "PR-2026-0113-4",
        name: "Pallet wrap dispenser (handheld)",
        quantity: 3,
        batch: null,
        status: "Awaiting Batch Assignment",
        statusTone: "neutral",
      },
    ],
    batches: [
      {
        batch: 1,
        quotesRequired: 3,
        items: [
          {
            id: "PR-2026-0113-1",
            name: "Steel drum pallets (48in)",
            quantity: 6,
          },
          { id: "PR-2026-0113-2", name: "Stretch wrap film", quantity: 40 },
        ],
        quotes: [
          {
            id: "q-1",
            vendor: "Del Rosario Trading",
            total: 18400,
            deliveryEstimate: "4 business days",
            quoteDate: "Jul 14",
          },
          {
            id: "q-2",
            vendor: "Acme Industrial Supply",
            total: 19750,
            deliveryEstimate: "2 business days",
            quoteDate: "Jul 13",
          },
          {
            id: "q-3",
            vendor: "Pacific Fasteners Inc.",
            total: 21000,
            deliveryEstimate: "5 business days",
            quoteDate: "Jul 13",
          },
          {
            id: "q-4",
            vendor: "Metro Lubricants Corp",
            total: 20100,
            deliveryEstimate: "3 business days",
            quoteDate: "Jul 14",
          },
        ],
      },
      {
        batch: 2,
        quotesRequired: 3,
        items: [
          {
            id: "PR-2026-0113-3",
            name: "Corner edge protectors",
            quantity: 200,
          },
        ],
        quotes: [
          {
            id: "q-5",
            vendor: "Pacific Fasteners Inc.",
            total: 9400,
            deliveryEstimate: "3 business days",
            quoteDate: "Jul 15",
          },
          {
            id: "q-6",
            vendor: "Acme Industrial Supply",
            total: 10250,
            deliveryEstimate: "4 business days",
            quoteDate: "Jul 15",
          },
          {
            id: "q-7",
            vendor: "Del Rosario Trading",
            total: 9900,
            deliveryEstimate: "6 business days",
            quoteDate: "Jul 14",
          },
        ],
        selectedVendorId: "q-5",
        selectedOn: "Jul 15",
      },
    ],
  },
];

export function getCanvassingDetail(purchaseRequestId: string) {
  return canvassingDetails.find(
    (detail) => detail.purchaseRequestId === purchaseRequestId,
  );
}

export function getCanvassingBatch(purchaseRequestId: string, batch: number) {
  return getCanvassingDetail(purchaseRequestId)?.batches.find(
    (candidate) => candidate.batch === batch,
  );
}
