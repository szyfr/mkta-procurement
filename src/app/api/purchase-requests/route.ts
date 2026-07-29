import type { NextRequest } from "next/server";

import { ApiError, toErrorResponse } from "@/lib/api/errors";
import type { CreatePurchaseRequestPayload } from "@/modules/purchase-requests/api/client";
import {
  createPurchaseRequest,
  listPurchaseRequests,
} from "@/modules/purchase-requests/dal/purchase-request.dal";

/**
 * BFF for the purchase request collection. The browser reaches FastAPI only
 * through here, and never learns its address.
 */

function readPageParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const result = await listPurchaseRequests({
      page: readPageParam(searchParams.get("page"), 1),
      pageSize: readPageParam(searchParams.get("pageSize"), 10),
    });

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Validates the payload before it reaches FastAPI, which is lenient about it. */
function parseCreatePayload(body: unknown): CreatePurchaseRequestPayload {
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

export async function POST(request: NextRequest) {
  try {
    const payload = parseCreatePayload(await request.json().catch(() => null));

    const created = await createPurchaseRequest(payload);

    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
