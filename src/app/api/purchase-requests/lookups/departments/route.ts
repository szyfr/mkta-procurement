import { toErrorResponse } from "@/lib/api/errors";
import { listDepartments } from "@/modules/purchase-requests/dal/lookup.dal";

/**
 * Departments for the create form and the list's department filter.
 *
 * Scoped under `purchase-requests/lookups` on purpose: departments have no
 * module of their own yet, and this route exists only to serve Purchase
 * Requests screens. It should move to a Departments module when one is built.
 */
export async function GET() {
  try {
    return Response.json({ data: await listDepartments() });
  } catch (error) {
    return toErrorResponse(error);
  }
}
