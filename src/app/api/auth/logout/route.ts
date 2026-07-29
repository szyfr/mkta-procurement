import { NextResponse } from "next/server";

import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { withRoute } from "@/lib/http";

export const POST = withRoute(async () => {
    const response = NextResponse.json({ data: { ok: true } });
    response.cookies.set({
        ...sessionCookieOptions(),
        name: SESSION_COOKIE,
        value: "",
        maxAge: 0,
    });
    return response;
});
