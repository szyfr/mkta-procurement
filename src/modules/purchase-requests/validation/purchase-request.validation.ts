import { ApiError } from "@/lib/api/errors";
import type {
  PriorityDto,
  UpdatePurchaseRequestDto,
} from "@/modules/purchase-requests/dto";
import type {
  CreatePurchaseRequestPayload,
  SettablePurchaseRequestStatus,
} from "@/modules/purchase-requests/models/purchase-request";

/**
 * Request-body handling for the purchase request BFF routes: validating what
 * the browser sent, and mapping the camelCase shape the UI works in onto the
 * FastAPI DTO. FastAPI is lenient about both, so the checks happen here where a
 * failure can be reported as a proper 422.
 */

const SETTABLE_STATUSES: SettablePurchaseRequestStatus[] = [
  "pending",
  "canceled",
];

/**
 * Guards the status path segment. The backend's enum is much wider, but every
 * other transition is owned by canvassing and PO processing, so anything else
 * arriving here is a bug or a hand-crafted request rather than a user error.
 */
export function parseSettableStatus(
  value: string,
): SettablePurchaseRequestStatus {
  const status = SETTABLE_STATUSES.find((allowed) => allowed === value);

  if (!status) {
    throw new ApiError(
      422,
      "validation_failed",
      `Status must be one of: ${SETTABLE_STATUSES.join(", ")}.`,
    );
  }

  return status;
}

export function parseCreatePayload(
  body: unknown,
): CreatePurchaseRequestPayload {
  const invalid = (message: string) =>
    new ApiError(422, "validation_failed", message);

  if (!body || typeof body !== "object")
    throw invalid("Request body is missing.");

  const payload = body as Partial<CreatePurchaseRequestPayload>;

  const title = payload.title?.trim();
  if (!title) throw invalid("Title is required.");
  if (!payload.departmentId) throw invalid("Department is required.");
  if (!payload.dateNeeded) throw invalid("Date needed is required.");
  if (!payload.justification?.trim())
    throw invalid("Justification is required.");

  const priority = payload.priority ?? "normal";
  if (!["low", "normal", "high"].includes(priority)) {
    throw invalid("Priority must be low, normal, or high.");
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw invalid("Add at least one item.");
  }

  const items = payload.items.map((item, index) => {
    if (!item?.materialId)
      throw invalid(`Item ${index + 1} needs an item selected.`);
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw invalid(`Item ${index + 1} needs a quantity greater than zero.`);
    }

    return {
      materialId: item.materialId,
      quantity: item.quantity,
      vendorId: item.vendorId ?? null,
    };
  });

  return {
    title,
    departmentId: payload.departmentId,
    dateNeeded: payload.dateNeeded,
    priority,
    justification: payload.justification.trim(),
    items,
  };
}

/**
 * Every field on an update is optional; only what was sent is forwarded.
 *
 * `status` is not among them. FastAPI would accept it here, but only the
 * dedicated status endpoint cascades the change onto the request's items, so
 * that transition has one path and this one carries edits alone.
 */
export function toUpdateDto(body: unknown): UpdatePurchaseRequestDto {
  if (!body || typeof body !== "object") return {};

  const payload = body as {
    title?: string;
    departmentId?: string;
    dateNeeded?: string;
    priority?: PriorityDto;
    justification?: string;
    items?: {
      materialId: string;
      quantity: number;
      vendorId?: string | null;
    }[];
  };

  return {
    ...(payload.title === undefined ? {} : { title: payload.title }),
    ...(payload.departmentId === undefined
      ? {}
      : { department_id: payload.departmentId }),
    ...(payload.dateNeeded === undefined
      ? {}
      : { date_needed: payload.dateNeeded }),
    ...(payload.priority === undefined ? {} : { priority: payload.priority }),
    ...(payload.justification === undefined
      ? {}
      : { justification: payload.justification }),
    ...(payload.items === undefined
      ? {}
      : {
          items: payload.items.map((item) => ({
            material_id: item.materialId,
            quantity: item.quantity,
            vendor_id: item.vendorId ?? null,
          })),
        }),
  };
}
