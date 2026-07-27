import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db, ensureDatabaseReady, schema } from "@/db";
import {
  serializeSession,
  sessionCookieOptions,
  toSessionUser,
} from "@/lib/auth/session";
import { ApiError, withRoute } from "@/lib/http";
import { login } from "@/lib/validation/schemas";

/**
 * Issues the session cookie.
 *
 * This is a stand-in: there are no stored credentials, so the password is
 * accepted without being checked and the email alone identifies the user. It
 * exists to establish the shape — an HttpOnly cookie minted server-side, never
 * a token handed to React.
 *
 * When FastAPI takes over, this handler forwards the credentials upstream and
 * relays the `Set-Cookie` it returns; the client-side flow does not change.
 */
export const POST = withRoute(async (request: Request) => {
  await ensureDatabaseReady();

  const body: unknown = await request.json();
  const { email } = login.parse(body);

  const user = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();

  if (!user) {
    throw new ApiError(
      "UNAUTHORIZED",
      "Those credentials were not recognised.",
    );
  }

  const response = NextResponse.json({ data: toSessionUser(user) });
  response.cookies.set({
    ...sessionCookieOptions(),
    value: serializeSession(user.id),
  });

  return response;
});
