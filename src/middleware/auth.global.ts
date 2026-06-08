import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { hasStudioAccess, useAuthSession } from "~/features/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith("/login") || to.path.startsWith("/invite/accept")) {
    return;
  }

  const { bootstrap } = useAuthSession();
  const user = await bootstrap().catch(() => null);

  if (!user) {
    return navigateTo("/login");
  }

  if (!hasStudioAccess(user)) {
    return navigateTo("/login?denied=role");
  }
});
