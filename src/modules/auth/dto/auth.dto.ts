/**
 * The FastAPI `/auth` contract, verbatim. Server-side only — these shapes stop
 * at the mappers and never reach the browser.
 */

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  status: number;
  user: {
    _id: string;
    email: string;
    /** Already joined upstream from `firstname` and `lastname`. */
    name: string;
  };
  token: {
    access_token: string;
    token_type: string;
    /** Seconds. The JWT's real lifetime, and what our session cookie is sized to. */
    expires_in: number;
  };
}

/**
 * `GET /auth/me`.
 *
 * Its response model extends the stored user document, so the payload also
 * carries `password` — the bcrypt hash. It is deliberately absent from this
 * interface: nothing downstream should be able to reach for it, and
 * `toAuthenticatedUser` is what keeps it from leaving the server.
 *
 * The id arrives as `_id` (FastAPI serializes response models by alias) but the
 * handler also sets a plain `id`, so both spellings are accepted.
 */
export interface CurrentUserDto {
  _id?: string;
  id?: string;
  email: string;
  firstname: string;
  lastname: string;
  permissions?: string[];
}
