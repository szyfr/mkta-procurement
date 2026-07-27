import "server-only";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db, ensureDatabaseReady, schema } from "@/db";
import type { Actor, SessionUser } from "@/types";

/**
 * Session handling, shaped for the backend that will replace this one.
 *
 * FastAPI will issue the cookie; the BFF's job is only to carry it and to
 * resolve a principal from it. Nothing here ever reaches React — the browser
 * holds an opaque HttpOnly cookie and the client asks `/api/session` who it is.
 *
 * Enforcement is deliberately off for now: an unauthenticated request resolves
 * to the seeded procurement officer instead of being rejected, so the app can
 * be exercised end to end without a login step. Turning it on means having
 * `getCurrentUser` throw `UNAUTHORIZED` rather than falling back, plus adding
 * the guard to `proxy.ts` — no call site changes.
 */

export const SESSION_COOKIE = "procurement_session";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Opaque-to-the-client, but not signed — it is a stand-in for a token minted by
 * a real identity provider, not a security boundary. When FastAPI takes over,
 * this encoding disappears entirely and the upstream `Set-Cookie` is relayed
 * through untouched.
 */
function encodeSession(userId: string): string {
  return Buffer.from(JSON.stringify({ userId }), "utf8").toString("base64url");
}

function decodeSession(value: string): string | null {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "userId" in parsed &&
      typeof (parsed as { userId: unknown }).userId === "string"
    ) {
      return (parsed as { userId: string }).userId;
    }
  } catch {
    // A malformed cookie is treated as no cookie.
  }
  return null;
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

export function serializeSession(userId: string): string {
  return encodeSession(userId);
}

type UserRow = typeof schema.users.$inferSelect;

function toActor(user: UserRow): Actor {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  };
}

export function toSessionUser(user: UserRow): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    avatar: user.avatar,
  };
}

function findUserById(userId: string): UserRow | undefined {
  return db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .get();
}

function findSeededUser(): UserRow | undefined {
  return (
    db
      .select()
      .from(schema.users)
      .where(eq(schema.users.isCurrentUser, true))
      .get() ?? db.select().from(schema.users).get()
  );
}

/** The signed-in user row, resolved from the cookie or the seeded default. */
export async function getSessionUser(): Promise<UserRow> {
  await ensureDatabaseReady();

  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  const userId = raw ? decodeSession(raw) : null;

  const user = (userId ? findUserById(userId) : undefined) ?? findSeededUser();
  if (!user) {
    throw new Error("No users exist — the database was not seeded.");
  }
  return user;
}

/** The principal handed to repositories so writes record who made them. */
export async function getCurrentUser(): Promise<Actor> {
  return toActor(await getSessionUser());
}
