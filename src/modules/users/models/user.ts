/**
 * The `/users` list response item. `password` arrives on the upstream
 * document too, but it never crosses the DAL boundary — see `dal/user.dal.ts`
 * — so it has no place in the shape components read.
 */
export interface User {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  created_at: string;
  updated_at: string;
}

/** A role joined onto `/users/{id}`. */
export interface UserRole {
  _id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/** The `/users/{id}` response, once the DAL has unwrapped the one-item array. */
export interface UserDetail extends User {
  roles: UserRole[];
}

/** The `PATCH /users/{id}/roles` response — a confirmation message only, not the updated user. */
export interface UpdateUserRolesResult {
  message: string;
}
