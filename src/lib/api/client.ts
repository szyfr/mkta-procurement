import type { ApiErrorBody, ApiErrorCode, ApiSuccess } from "@/types/api";

/**
 * The single place the browser talks to the BFF.
 *
 * Every response goes through the same envelope, so callers receive the payload
 * directly and failures arrive as a typed exception — which is exactly the
 * contract TanStack Query expects (`data` on success, a throw on error).
 *
 * Requests are same-origin and the session cookie is HttpOnly, so it rides
 * along automatically and no token is ever read, stored, or attached by hand.
 */

export class ApiClientError extends Error {
    readonly status: number;
    readonly code: ApiErrorCode | "NETWORK";
    readonly details?: unknown;

    constructor(
        status: number,
        code: ApiErrorCode | "NETWORK",
        message: string,
        details?: unknown,
    ) {
        super(message);
        this.name = "ApiClientError";
        this.status = status;
        this.code = code;
        this.details = details;
    }

    /** True when the resource is simply absent, which pages render as "not found". */
    get isNotFound(): boolean {
        return this.code === "NOT_FOUND";
    }
}

const BASE_PATH = "/api";

function buildUrl(path: string, query?: QueryParams): string {
    const url = `${BASE_PATH}${path}`;
    if (!query) return url;

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === "") continue;
        params.set(key, String(value));
    }

    const serialized = params.toString();
    return serialized ? `${url}?${serialized}` : url;
}

export type QueryParams = Record<
    string,
    string | number | boolean | undefined | null
>;

async function request<T>(
    method: string,
    path: string,
    options: { query?: QueryParams; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
    const headers: Record<string, string> = { accept: "application/json" };
    if (options.body !== undefined)
        headers["content-type"] = "application/json";

    let response: Response;
    try {
        response = await fetch(buildUrl(path, options.query), {
            method,
            headers,
            credentials: "same-origin",
            signal: options.signal,
            ...(options.body === undefined
                ? {}
                : { body: JSON.stringify(options.body) }),
        });
    } catch (reason) {
        // An aborted request is TanStack Query cancelling it, not a failure.
        if (reason instanceof DOMException && reason.name === "AbortError")
            throw reason;
        throw new ApiClientError(0, "NETWORK", "Could not reach the server.");
    }

    if (response.status === 204) return undefined as T;

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const body = payload as ApiErrorBody | null;
        throw new ApiClientError(
            response.status,
            body?.error?.code ?? "INTERNAL",
            body?.error?.message ?? "The request failed.",
            body?.error?.details,
        );
    }

    return (payload as ApiSuccess<T>).data;
}

/** Same as `request`, but also returns the envelope's `meta` (paging totals). */
async function requestWithMeta<T>(
    path: string,
    query?: QueryParams,
    signal?: AbortSignal,
): Promise<{ data: T; meta?: Record<string, unknown> }> {
    const response = await fetch(buildUrl(path, query), {
        headers: { accept: "application/json" },
        credentials: "same-origin",
        signal,
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const body = payload as ApiErrorBody | null;
        throw new ApiClientError(
            response.status,
            body?.error?.code ?? "INTERNAL",
            body?.error?.message ?? "The request failed.",
            body?.error?.details,
        );
    }

    const envelope = payload as ApiSuccess<T>;
    return { data: envelope.data, meta: envelope.meta };
}

export const apiClient = {
    get: <T>(path: string, query?: QueryParams, signal?: AbortSignal) =>
        request<T>("GET", path, { query, signal }),
    getWithMeta: requestWithMeta,
    post: <T>(path: string, body?: unknown) =>
        request<T>("POST", path, { body }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>("PATCH", path, { body }),
    delete: <T>(path: string) => request<T>("DELETE", path),
};
