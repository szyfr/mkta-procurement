/**
 * What the UI knows about the signed-in user.
 *
 * There is no token here, by design. The JWT lives in an HttpOnly cookie the
 * browser cannot read, so "am I signed in?" is answered by asking the backend
 * (`GET /api/auth/session`), never by inspecting anything held client-side.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  /** Permission slugs from `/auth/me`; empty until roles are granted upstream. */
  permissions: string[];
}

/**
 * What the login response alone can tell us. `POST /auth/login` returns no
 * permissions, so the sign-in result is deliberately narrower than a session —
 * the full user is read back from `/auth/me` once the cookie is set.
 */
export type SignedInUser = Omit<AuthenticatedUser, "permissions">;

/** What the login form submits. */
export interface Credentials {
  email: string;
  password: string;
}
