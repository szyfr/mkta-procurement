import { ok, withRoute } from "@/lib/http";
import { requestContextFrom } from "@/lib/repositories";
import { FastApiClient } from "@/lib/repositories/fastapi";

/**
 * Readiness probe. Reports whether the BFF can reach FastAPI, which is the
 * only dependency it has now — the quickest way to tell a misconfigured
 * `FASTAPI_BASE_URL` from an application error.
 */
export const GET = withRoute(async (request: Request) => {
    const client = new FastApiClient(requestContextFrom(request));

    let upstream: { reachable: boolean; detail?: string };
    try {
        await client.get<unknown>("/healthz");
        upstream = { reachable: true };
    } catch (reason) {
        upstream = {
            reachable: false,
            detail: reason instanceof Error ? reason.message : "Unknown error",
        };
    }

    return ok({
        status: upstream.reachable ? "ok" : "degraded",
        backend: "fastapi",
        upstream,
        // The modules FastAPI does not serve yet, listed so a reader of the
        // probe knows which parts of the app are answering empty rather than
        // reporting real data — and which writes still return 501.
        notImplemented: [
            "dashboard",
            "canvassing",
            "reports",
            "notifications",
            "search",
            "settings",
            "item-creation-requests",
            "payment-terms",
        ],
    });
});
