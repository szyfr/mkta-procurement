import { created } from "@/lib/http";
import { defineRoute } from "@/lib/http/route";
import { createBatch } from "@/lib/validation/schemas";

export const POST = defineRoute<{ id: string }>(
    async ({ request, params, repos, actor }) => {
        const body: unknown = await request.json();
        const input = createBatch.parse(body);

        return created(
            await repos.canvassing.createBatch(params.id, input, actor),
        );
    },
);
