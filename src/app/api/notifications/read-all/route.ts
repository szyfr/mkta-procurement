import { ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";

export const POST = defineRoute(async ({ repos, actor }) =>
    ok(await repos.notifications.markAllRead(actor)),
);
