import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import {
  deletePurchaseRequest,
  getPurchaseRequest,
  updatePurchaseRequest,
} from "@/modules/purchase-requests/dal/purchase-request.dal";
import type {
  PriorityDto,
  UpdatePurchaseRequestDto,
} from "@/modules/purchase-requests/dto";

/** The only status value the UI sends today — submitting a draft for approval. */
type SubmittableStatus = "pending";

/**
 * BFF for a single purchase request.
 *
 * FastAPI answers `PUT` with 201 and `DELETE` with a 204 that carries a body;
 * both are normalized here so the frontend sees ordinary 200/204 responses.
 */

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/purchase-requests/[id]">,
) {
  try {
    const { id } = await context.params;

    return Response.json({ data: await getPurchaseRequest(id) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Accepts the camelCase shape the UI works in and maps it to the FastAPI DTO. */
function toUpdateDto(body: unknown): UpdatePurchaseRequestDto {
  if (!body || typeof body !== "object") return {};

  const payload = body as {
    title?: string;
    departmentId?: string;
    dateNeeded?: string;
    priority?: PriorityDto;
    justification?: string;
    status?: SubmittableStatus;
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
    ...(payload.status === undefined ? {} : { status: payload.status }),
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

export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/purchase-requests/[id]">,
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);

    const updated = await updatePurchaseRequest(id, toUpdateDto(body));

    return Response.json({ data: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext<"/api/purchase-requests/[id]">,
) {
  try {
    const { id } = await context.params;

    await deletePurchaseRequest(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
