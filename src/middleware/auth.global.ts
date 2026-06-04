import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { useAuthSession } from "~/features/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith("/login")) {
    return;
  }

  const { bootstrap } = useAuthSession();
  const user = await bootstrap().catch(() => null);

  if (!user) {
    return navigateTo("/login");
  }
});
