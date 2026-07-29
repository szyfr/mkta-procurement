import { created, ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";
import { createItemCreationRequest } from "@/lib/validation/schemas";

export const GET = defineRoute(async ({ repos }) =>
    ok(await repos.itemCreationRequests.list()),
);

export const POST = defineRoute(async ({ request, repos, actor }) => {
    const body: unknown = await request.json();
    const input = createItemCreationRequest.parse(body);

    return created(await repos.itemCreationRequests.create(input, actor));
});
