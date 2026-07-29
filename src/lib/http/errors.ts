import type { ApiErrorCode } from "@/types/api";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_FAILED: 422,
    NOT_IMPLEMENTED: 501,
    INTERNAL: 500,
};

/**
 * An error with an HTTP identity. Repositories throw these; `withRoute`
 * translates them into the error envelope so handlers never build one by hand.
 */
export class ApiError extends Error {
    readonly code: ApiErrorCode;
    readonly status: number;
    readonly details?: unknown;

    constructor(code: ApiErrorCode, message: string, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.status = STATUS_BY_CODE[code];
        this.details = details;
    }

    static notFound(what: string) {
        return new ApiError("NOT_FOUND", `${what} was not found.`);
    }

    static badRequest(message: string, details?: unknown) {
        return new ApiError("BAD_REQUEST", message, details);
    }

    static conflict(message: string) {
        return new ApiError("CONFLICT", message);
    }

    static notImplemented(message: string) {
        return new ApiError("NOT_IMPLEMENTED", message);
    }
}
