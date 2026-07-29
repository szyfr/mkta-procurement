import { ApiError, ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";

export const GET = defineRoute<{ id: string }>(async ({ params, repos }) => {
    const detail = await repos.canvassing.getDetail(params.id);
    if (!detail) throw ApiError.notFound(`Canvassing for ${params.id}`);
    return ok(detail);
});
