import { ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";
import { catalogItemQuery, parseQuery } from "@/lib/validation/schemas";

/**
 * The catalog is paged. The backend holds ~1,900 materials and caps its own
 * page size at 100, so the picker loads them a page at a time as the user
 * scrolls rather than shipping the lot to the browser at once.
 *
 * `search` narrows it upstream instead, which is what lets the picker find an
 * item that sits well past the pages it has loaded.
 */
export const GET = defineRoute(async ({ request, repos }) => {
    const { page, pageSize, search } = parseQuery(
        catalogItemQuery,
        request.url,
    );
    const result = await repos.reference.listCatalogItems(
        page,
        pageSize,
        search,
    );

    return ok(result.items, {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
    });
});
