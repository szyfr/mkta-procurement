import { ApiError, ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";
import { parseQuery, reportQuery } from "@/lib/validation/schemas";

export const GET = defineRoute<{ id: string }>(
    async ({ request, params, repos }) => {
        const filters = parseQuery(reportQuery, request.url);
        const report = await repos.reports.get(params.id, filters);

        if (!report) throw ApiError.notFound(`Report ${params.id}`);
        return ok(report);
    },
);
