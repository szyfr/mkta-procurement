import { ApiError } from "@/lib/api/errors";
import type { Priority } from "@/lib/types";
import type {
  CreatePurchaseRequestInput,
  UpdatePurchaseRequestDto,
} from "@/modules/purchase-requests/dto";
import type { SettablePurchaseRequestStatus } from "@/modules/purchase-requests/models/purchase-request";

/**
 * Request-body validation for the purchase request BFF routes.
 *
 * The browser sends the FastAPI shape already, so there is no camelCase to
 * translate here — only checking. FastAPI is lenient about these fields, so the
 * checks happen where a failure can be reported as a proper 422.
 */

const SETTABLE_STATUSES: SettablePurchaseRequestStatus[] = [
  "pending",
  "canceled",
];

const PRIORITIES: Priority[] = ["low", "normal", "high"];

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

function invalid(message: string) {
  return new ApiError(422, "validation_failed", message);
}

/** Shared by create and update: every item needs a material and a quantity. */
function parseItems(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) {
    throw invalid("Add at least one item.");
  }

  return items.map((entry, index) => {
    const item = entry as {
      material_id?: string;
      quantity?: number;
      vendor_id?: string | null;
    } | null;

    if (!item?.material_id)
      throw invalid(`Item ${index + 1} needs an item selected.`);
    if (!Number.isFinite(item.quantity) || (item.quantity as number) <= 0) {
      throw invalid(`Item ${index + 1} needs a quantity greater than zero.`);
    }

    return {
      material_id: item.material_id,
      quantity: item.quantity as number,
      vendor_id: item.vendor_id ?? null,
    };
  });
}

export function parseCreatePayload(body: unknown): CreatePurchaseRequestInput {
  if (!body || typeof body !== "object")
    throw invalid("Request body is missing.");

  const payload = body as Partial<CreatePurchaseRequestInput>;

  const title = payload.title?.trim();
  if (!title) throw invalid("Title is required.");
  if (!payload.department_id) throw invalid("Department is required.");
  if (!payload.date_needed) throw invalid("Date needed is required.");
  if (!payload.justification?.trim())
    throw invalid("Justification is required.");

  const priority = payload.priority ?? "normal";
  if (!PRIORITIES.includes(priority)) {
    throw invalid("Priority must be low, normal, or high.");
  }

  // Undefined is a legitimate value here — the create form omits it for
  // "Save as Draft" and leans on the backend's own draft default.
  if (
    payload.status !== undefined &&
    payload.status !== "draft" &&
    payload.status !== "pending"
  ) {
    throw invalid('Status must be "draft" or "pending" when creating.');
  }

  return {
    title,
    department_id: payload.department_id,
    date_needed: payload.date_needed,
    priority,
    justification: payload.justification.trim(),
    items: parseItems(payload.items),
    status: payload.status,
  };
}

/**
 * Every field on an update is optional; only what was sent is forwarded.
 *
 * `status` is not among them. FastAPI would accept it here, but only the
 * dedicated status endpoint cascades the change onto the request's items, so
 * that transition has one path and this one carries edits alone.
 */
export function parseUpdatePayload(body: unknown): UpdatePurchaseRequestDto {
  if (!body || typeof body !== "object") return {};

  const payload = body as Partial<UpdatePurchaseRequestDto>;

  return {
    ...(payload.title === undefined ? {} : { title: payload.title }),
    ...(payload.department_id === undefined
      ? {}
      : { department_id: payload.department_id }),
    ...(payload.date_needed === undefined
      ? {}
      : { date_needed: payload.date_needed }),
    ...(payload.priority === undefined ? {} : { priority: payload.priority }),
    ...(payload.justification === undefined
      ? {}
      : { justification: payload.justification }),
    ...(payload.items === undefined
      ? {}
      : { items: parseItems(payload.items) }),
  };
}
