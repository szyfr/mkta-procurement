import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { signIn } from "@/modules/auth/dal/auth.dal";
import {
  readCsrfToken,
  writeCsrfCookie,
  writeSessionCookie,
} from "@/modules/auth/dal/auth-cookies";
import { parseCredentials } from "@/modules/auth/validation/login.validation";

/**
 * Exchanges credentials for a session cookie.
 *
 * The JWT stops here: it comes back in the upstream response body, goes into
 * an HttpOnly cookie, and is not part of what this route returns. The browser
 * receives the user's name and email and no credential of any kind.
 */

export async function POST(request: NextRequest) {
  try {
    const credentials = parseCredentials(
      await request.json().catch(() => null),
    );

    const csrfToken = await readCsrfToken();
    const result = await signIn(credentials, csrfToken);

    await writeSessionCookie(result.accessToken, result.expiresIn);

    // `signIn` mints a token when the caller had none, so persist it — the
    // cookie and the header it will be compared against have to stay a pair.
    if (!csrfToken) await writeCsrfCookie(result.csrfToken);

    return Response.json({ data: result.user });
  } catch (error) {
    return toErrorResponse(error);
  }
}
