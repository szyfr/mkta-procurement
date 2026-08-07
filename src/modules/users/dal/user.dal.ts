import { ApiError } from "@/lib/api/errors";
import { serverFetch } from "@/lib/api/fetcher";
import { assertObjectId } from "@/lib/api/object-id";
import { clampPageSize, type Paginated } from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/users/constants";
import type { UpdateUserRolesDto } from "@/modules/users/dto/update-user-roles.dto";
import type {
  UpdateUserRolesResult,
  User,
  UserDetail,
} from "@/modules/users/models/user";

const NOT_FOUND = "User not found";

/** Raw shapes as FastAPI sends them — `password` included, never returned as-is. */
type RawUser = User & { password: string };
type RawUserDetail = RawUser & { roles: UserDetail["roles"] };

/**
 * `/users` and `/users/{id}` answer with the stored user document, bcrypt
 * hash included — the same posture `/auth/me` takes. This is the boundary
 * that stops it, same as `getCurrentUser`; the rest of the document passes
 * through untouched.
 */
function dropPassword<T extends { password: string }>(
  raw: T,
): Omit<T, "password"> {
  const { password: _password, ...user } = raw;
  return user;
}

export interface ListUsersQuery {
  page?: number;
  pageSize?: number;
}

export async function listUsers(
  query: ListUsersQuery = {},
): Promise<Paginated<User>> {
  const result = await serverFetch<Paginated<RawUser>>("/users", {
    query: {
      page: query.page ?? 1,
      page_size: clampPageSize(query.pageSize, DEFAULT_PAGE_SIZE),
    },
  });

  return { ...result, data: result.data.map(dropPassword) };
}

/**
 * `GET /users/{id}` answers with an array containing a single user rather
 * than the object itself — a backend quirk, not a list — so this unwraps it.
 */
export async function getUser(id: string): Promise<UserDetail> {
  assertObjectId(id, NOT_FOUND);

  const result = await serverFetch<RawUserDetail[]>(`/users/${id}`);
  const user = result[0];

  if (!user) throw new ApiError(404, "not_found", NOT_FOUND);

  return dropPassword(user);
}

export function updateUserRoles(
  id: string,
  input: UpdateUserRolesDto,
): Promise<UpdateUserRolesResult> {
  assertObjectId(id, NOT_FOUND);

  return serverFetch<UpdateUserRolesResult>(`/users/${id}/roles`, {
    method: "PATCH",
    body: input,
  });
}
