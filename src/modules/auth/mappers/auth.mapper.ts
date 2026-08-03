import type {
  CurrentUserDto,
  LoginResponseDto,
} from "@/modules/auth/dto/auth.dto";
import type {
  AuthenticatedUser,
  SignedInUser,
} from "@/modules/auth/models/session";

/**
 * DTO → model, and the boundary two secrets stop at.
 *
 * `/auth/me` answers with the stored user document, hashed password included,
 * and `/auth/login` answers with the raw JWT. Both are picked apart field by
 * field here so neither can ride along into a Route Handler's response — the
 * token reaches the browser only as an HttpOnly cookie, and the hash not at all.
 */

export function toAuthenticatedUser(dto: CurrentUserDto): AuthenticatedUser {
  return {
    id: dto._id ?? dto.id ?? "",
    email: dto.email,
    name: [dto.firstname, dto.lastname].filter(Boolean).join(" ").trim(),
    permissions: dto.permissions ?? [],
  };
}

export function toSignedInUser(dto: LoginResponseDto): SignedInUser {
  return {
    id: dto.user._id,
    email: dto.user.email,
    name: dto.user.name,
  };
}
