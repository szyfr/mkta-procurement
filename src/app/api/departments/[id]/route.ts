import type { NextRequest } from "next/server";

import { ApiError, toErrorResponse } from "@/lib/api/errors";
import type { DepartmentPayload } from "@/modules/departments/api/client";
import {
  deleteDepartment,
  getDepartment,
  updateDepartment,
} from "@/modules/departments/dal/department.dal";

/** BFF for a single department. */

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/departments/[id]">,
) {
  try {
    const { id } = await context.params;

    return Response.json({ data: await getDepartment(id) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function parseDepartmentPayload(body: unknown): DepartmentPayload {
  const invalid = (message: string) =>
    new ApiError(422, "validation_failed", message);

  if (!body || typeof body !== "object")
    throw invalid("Request body is missing.");

  const payload = body as Partial<DepartmentPayload>;

  const title = payload.title?.trim();
  if (!title) throw invalid("Title is required.");

  return { title, description: payload.description?.trim() ?? "" };
}

export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/departments/[id]">,
) {
  try {
    const { id } = await context.params;
    const payload = parseDepartmentPayload(
      await request.json().catch(() => null),
    );

    const updated = await updateDepartment(id, payload);

    return Response.json({ data: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext<"/api/departments/[id]">,
) {
  try {
    const { id } = await context.params;

    await deleteDepartment(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
