import { NextResponse } from "next/server";

import {
    getSessionUser,
    serializeSession,
    sessionCookieOptions,
} from "@/lib/auth/session";
import { ApiError, withRoute } from "@/lib/http";
import { login } from "@/lib/validation/schemas";

/**
 * Issues the session cookie.
 *
 * A stand-in, and openly so: the backend exposes no authentication at all, so
 * there is nothing to check credentials against. Only the fixture user's own
 * address is accepted, and the password is ignored. It exists to establish the
 * shape — an HttpOnly cookie minted server-side, never a token handed to React.
 *
 * TODO(auth): forward the credentials to FastAPI and relay the `Set-Cookie` it
 * returns. `FastApiClient` already does the relaying; the client-side flow does
 * not change.
 */
export const POST = withRoute(async (request: Request) => {
    const body: unknown = await request.json();
    const { email } = login.parse(body);

    const user = await getSessionUser();
    if (user.email.toLowerCase() !== email.toLowerCase()) {
        throw new ApiError(
            "UNAUTHORIZED",
            "Those credentials were not recognised.",
        );
    }

    const response = NextResponse.json({ data: user });
    response.cookies.set({
        ...sessionCookieOptions(),
        value: serializeSession(user.id),
    });

    return response;
});
