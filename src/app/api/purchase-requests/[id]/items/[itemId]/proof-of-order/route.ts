import { ok } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";
import { proofOfOrder } from "@/lib/validation/schemas";

export const POST = defineRoute<{ id: string; itemId: string }>(
    async ({ request, params, repos, actor }) => {
        const body: unknown = await request.json();
        const input = proofOfOrder.parse(body);

        return ok(
            await repos.purchaseRequests.recordProofOfOrder(
                params.id,
                params.itemId,
                input,
                actor,
            ),
        );
    },
);
