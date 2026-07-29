import { ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";
import { updateAccount } from "@/lib/validation/schemas";

export const GET = defineRoute(async ({ repos, actor }) =>
    ok(await repos.users.getAccount(actor)),
);

export const PATCH = defineRoute(async ({ request, repos, actor }) => {
    const body: unknown = await request.json();
    const input = updateAccount.parse(body);
    return ok(await repos.users.updateAccount(input, actor));
});
