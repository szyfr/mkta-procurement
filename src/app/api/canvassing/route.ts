import { ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";
import { canvassingQuery, parseQuery } from "@/lib/validation/schemas";

export const GET = defineRoute(async ({ request, repos }) => {
    const filters = parseQuery(canvassingQuery, request.url);
    return ok(await repos.canvassing.listCases(filters));
});
