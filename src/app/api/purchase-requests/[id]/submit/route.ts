import { ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";

export const POST = defineRoute<{ id: string }>(
  async ({ params, repos, actor }) =>
    ok(await repos.purchaseRequests.submit(params.id, actor)),
);
