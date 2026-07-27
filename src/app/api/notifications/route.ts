import { ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";

export const GET = defineRoute(async ({ repos, actor }) =>
  ok(await repos.notifications.list(actor)),
);
