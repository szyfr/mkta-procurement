import type { NextRequest } from "next/server";

import { ApiError, toErrorResponse } from "@/lib/api/errors";
import type { DepartmentPayload } from "@/modules/departments/api/client";
import {
  createDepartment,
  listDepartments,
} from "@/modules/departments/dal/department.dal";

/**
 * BFF for the department collection. The browser reaches FastAPI only
 * through here, and never learns its address.
 */

function readPageParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const result = await listDepartments({
      page: readPageParam(searchParams.get("page"), 1),
      pageSize: readPageParam(searchParams.get("pageSize"), 10),
    });

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Validates the payload before it reaches FastAPI, which is lenient about it. */
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

export async function POST(request: NextRequest) {
  try {
    const payload = parseDepartmentPayload(
      await request.json().catch(() => null),
    );

    const created = await createDepartment(payload);

    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
