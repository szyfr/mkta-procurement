import { ApiError, noContent, ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";
import { updatePurchaseRequest } from "@/lib/validation/schemas";

type Params = { id: string };

export const GET = defineRoute<Params>(async ({ params, repos }) => {
  const request = await repos.purchaseRequests.getById(params.id);
  if (!request) throw ApiError.notFound(`Purchase request ${params.id}`);
  return ok(request);
});

export const PATCH = defineRoute<Params>(
  async ({ request, params, repos, actor }) => {
    const body: unknown = await request.json();
    const input = updatePurchaseRequest.parse(body);
    return ok(await repos.purchaseRequests.update(params.id, input, actor));
  },
);

export const DELETE = defineRoute<Params>(async ({ params, repos }) => {
  await repos.purchaseRequests.delete(params.id);
  return noContent();
});
