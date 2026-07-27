import { ApiError, ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";
import { selectVendor } from "@/lib/validation/schemas";

export const POST = defineRoute<{ id: string; batch: string }>(
  async ({ request, params, repos, actor }) => {
    const batch = Number(params.batch);
    if (!Number.isInteger(batch)) {
      throw ApiError.badRequest(`"${params.batch}" is not a batch number.`);
    }

    const body: unknown = await request.json();
    const input = selectVendor.parse(body);

    return ok(
      await repos.canvassing.selectVendor(params.id, batch, input, actor),
    );
  },
);
