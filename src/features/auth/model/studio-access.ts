import type { AuthMe, AuthRole } from "~/features/auth/model/types";

export const STUDIO_ROLES: readonly AuthRole[] = ["admin", "teacher", "content_manager"];

export function hasStudioAccess(user: AuthMe | null | undefined): boolean {
  return Boolean(user?.roles.some((role) => STUDIO_ROLES.includes(role)));
}
