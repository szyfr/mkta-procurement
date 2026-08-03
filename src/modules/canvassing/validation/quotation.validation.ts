import { ApiError } from "@/lib/api/errors";
import { isObjectId } from "@/lib/api/object-id";
import type {
  CreateQuotationPayload,
  QuotationItemPrice,
} from "@/modules/canvassing/models/quotation";

/**
 * Request-body parsing for the quotation Route Handler.
 *
 * This layer earns its keep more than most. `POST /quotations` builds its form
 * fields inside a FastAPI dependency, which runs *before* the handler's own
 * `try` — so a malformed `item_pricing` string or a single bad ObjectId
 * escapes as an opaque 500 rather than a 422 naming the field. Everything the
 * upstream would choke on is therefore checked here first.
 *
 * `validation_failed` is also the one code whose message `toPublicMessage`
 * passes through, so these strings are what the user actually reads.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function invalid(message: string) {
  return new ApiError(422, "validation_failed", message);
}

function readText(form: FormData, field: string): string {
  const value = form.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function readDate(form: FormData, field: string, label: string): string {
  const value = readText(form, field);

  if (!value) throw invalid(`${label} is required.`);

  // FastAPI parses these as `datetime.date`; anything carrying a time is
  // rejected upstream, and any other shape never reaches a date at all.
  if (!DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    throw invalid(`${label} must be a valid date.`);
  }

  return value;
}

function readObjectId(form: FormData, field: string, label: string): string {
  const value = readText(form, field);

  if (!value) throw invalid(`${label} is required.`);
  if (!isObjectId(value)) throw invalid(`${label} is not valid.`);

  return value;
}

function parseItemPricing(raw: string): QuotationItemPrice[] {
  if (!raw) throw invalid("Price at least one item.");

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw invalid("Item pricing couldn't be read.");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw invalid("Price at least one item.");
  }

  return parsed.map((entry, index) => {
    const row = entry as Partial<QuotationItemPrice> | null;
    const position = index + 1;

    if (!row || !isObjectId(row.itemId)) {
      throw invalid(`Item ${position} is not a valid purchase request item.`);
    }

    if (!Number.isFinite(row.unitPrice) || (row.unitPrice as number) < 0) {
      throw invalid(`Item ${position} needs a unit price of zero or more.`);
    }

    return { itemId: row.itemId, unitPrice: row.unitPrice as number };
  });
}

/**
 * The browser posts `multipart/form-data` because the upstream does, so the
 * scalars arrive as strings and `itemPricing` as a JSON blob in one field.
 */
export function parseCreateQuotationForm(form: FormData): {
  payload: CreateQuotationPayload;
  attachments: File[];
} {
  const referenceNo = readText(form, "referenceNo");
  if (!referenceNo) throw invalid("Quote reference number is required.");

  const payload: CreateQuotationPayload = {
    referenceNo,
    date: readDate(form, "date", "Quote date"),
    deliveryDate: readDate(form, "deliveryDate", "Delivery date"),
    vendorId: readObjectId(form, "vendorId", "Vendor"),
    paymentTermId: readObjectId(form, "paymentTermId", "Payment term"),
    itemPricing: parseItemPricing(readText(form, "itemPricing")),
  };

  // Empty parts are what a file input contributes when nothing was picked.
  const attachments = form
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  return { payload, attachments };
}
