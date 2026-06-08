export { useAuthClient } from "~/features/auth/api/auth-client";
export {
  canManageCourseOffers,
  hasStudioAccess,
  STUDIO_ROLES
} from "~/features/auth/model/studio-access";
export { useAuthSession } from "~/features/auth/model/use-auth-session";
export type {
  AuthInviteAcceptPayload,
  AuthLoginPayload,
  AuthMe,
  AuthRegisterPayload,
  AuthRole,
  AuthSessionSnapshot,
  AuthStatus
} from "~/features/auth/model/types";
