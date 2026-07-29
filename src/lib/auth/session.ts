import "server-only";

import type { Actor, SessionUser } from "@/types";

/**
 * Session handling, shaped for the backend that will eventually own it.
 *
 * FastAPI has no auth endpoints — no login, no user collection, and
 * `purchase_requests.requester_id` is an opaque string reserved for a Cognito
 * user pool id. Authentication is out of scope for this migration, so the
 * signed-in user is this one hardcoded principal and every request is treated
 * as coming from them. It is scaffolding, not demo data — there is no seed
 * behind it and nothing to keep in sync.
 *
 * The cookie machinery below is kept deliberately. When FastAPI issues
 * sessions, `FastApiClient` already forwards the `Cookie` header upstream and
 * relays `Set-Cookie` back down; what changes here is where the principal comes
 * from, not how it travels. Nothing here ever reaches React — the browser holds
 * an opaque HttpOnly cookie and the client asks `/api/session` who it is.
 *
 * TODO(auth): resolve the principal from the upstream session instead, and have
 * `getCurrentUser` throw `UNAUTHORIZED` instead of falling back. No call site
 * changes when it does.
 */

const DEFAULT_USER: SessionUser = {
    id: "1",
    name: "Procurement User",
    email: "procurement@mkta.local",
    role: "Procurement Officer",
    department: "Procurement",
    avatar: "",
};

export const SESSION_COOKIE = "procurement_session";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Opaque-to-the-client, but not signed — a stand-in for a token minted by a
 * real identity provider, not a security boundary. When FastAPI takes over,
 * this encoding disappears and the upstream `Set-Cookie` is relayed untouched.
 */
export function serializeSession(userId: string): string {
    return Buffer.from(JSON.stringify({ userId }), "utf8").toString(
        "base64url",
    );
}

export function sessionCookieOptions() {
    return {
        name: SESSION_COOKIE,
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE_SECONDS,
    };
}

/** The signed-in user, as exposed to the client. */
export async function getSessionUser(): Promise<SessionUser> {
    return DEFAULT_USER;
}

/** The principal handed to repositories so writes record who made them. */
export async function getCurrentUser(): Promise<Actor> {
    const { id, name, email, role, department } = await getSessionUser();
    return { id, name, email, role, department };
}

/**
 * Display name for a stored `requester_id`.
 *
 * There is no user collection upstream to join against — only the one
 * principal this app authenticates as. A `requester_id` from any other source
 * (a request made directly against FastAPI, or from before this app existed)
 * has no name to resolve to, so the raw id is returned rather than guessed at.
 */
export function requesterDisplayName(id: string | null | undefined): string {
    if (!id) return "";
    return id === DEFAULT_USER.id ? DEFAULT_USER.name : id;
}
