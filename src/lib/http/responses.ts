import { ZodError } from "zod";

import type { ApiErrorBody, ApiSuccess } from "@/types/api";

import { ApiError } from "./errors";

/** 200 with the uniform success envelope. */
export function ok<T>(data: T, meta?: Record<string, unknown>): Response {
  return Response.json({
    data,
    ...(meta ? { meta } : {}),
  } satisfies ApiSuccess<T>);
}

/** 201 for a freshly created resource. */
export function created<T>(data: T): Response {
  return Response.json({ data } satisfies ApiSuccess<T>, { status: 201 });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

function errorResponse(body: ApiErrorBody, status: number): Response {
  return Response.json(body, { status });
}

/**
 * Wraps a route handler so that every failure leaves through the same envelope.
 *
 * Unrecognised errors are logged server-side and reported as a bare 500: the
 * message of an arbitrary thrown error can carry a file path, a SQL fragment,
 * or a connection string, none of which belong in a client response.
 */
export function withRoute<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response> | Response,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (reason) {
      if (reason instanceof ApiError) {
        return errorResponse(
          {
            error: {
              code: reason.code,
              message: reason.message,
              ...(reason.details === undefined
                ? {}
                : { details: reason.details }),
            },
          },
          reason.status,
        );
      }

      if (reason instanceof ZodError) {
        return errorResponse(
          {
            error: {
              code: "VALIDATION_FAILED",
              message: "The request body failed validation.",
              details: reason.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
              })),
            },
          },
          422,
        );
      }

      console.error("[api] unhandled error", reason);
      return errorResponse(
        {
          error: {
            code: "INTERNAL",
            message: "Something went wrong handling this request.",
          },
        },
        500,
      );
    }
  };
}
