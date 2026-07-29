import { created, ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";
import {
    createPurchaseRequest,
    parseQuery,
    purchaseRequestQuery,
} from "@/lib/validation/schemas";

export const GET = defineRoute(async ({ request, repos }) => {
    const filters = parseQuery(purchaseRequestQuery, request.url);
    const page = await repos.purchaseRequests.list(filters);

    return ok(page.items, {
        total: page.total,
        page: page.page,
        pageSize: page.pageSize,
    });
});

export const POST = defineRoute(async ({ request, repos, actor }) => {
    const body: unknown = await request.json();
    const input = createPurchaseRequest.parse(body);

    return created(await repos.purchaseRequests.create(input, actor));
});
