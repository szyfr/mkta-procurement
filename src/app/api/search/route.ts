import { ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";
import { parseQuery, searchQuery } from "@/lib/validation/schemas";

export const GET = defineRoute(async ({ request, repos }) => {
  const { q } = parseQuery(searchQuery, request.url);
  return ok(await repos.search.search(q ?? ""));
});
