import { ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";

export const PATCH = defineRoute<{ id: string }>(
  async ({ params, repos, actor }) =>
    ok(await repos.notifications.markRead(params.id, actor)),
);
