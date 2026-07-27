import { ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";

export const GET = defineRoute(async ({ repos }) =>
  ok(await repos.users.listRolePermissions()),
);
