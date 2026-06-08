import { defineEventHandler, getRequestURL, setHeader, setResponseStatus } from "h3";

import { hasStudioAccess } from "~/features/auth";
import { proxyMe } from "~/server/utils/auth-proxy";

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;

  if (!pathname.startsWith("/api/admin/")) {
    return;
  }

  const user = await proxyMe(event);

  if (!("roles" in user)) {
    return user;
  }

  if (hasStudioAccess(user)) {
    return;
  }

  setResponseStatus(event, 403, "Forbidden");
  setHeader(event, "Content-Type", "application/problem+json");

  return {
    detail: "Studio access requires admin, teacher, or content_manager role.",
    instance: pathname,
    status: 403,
    title: "Access denied",
    type: "https://api.example.com/problems/access-denied"
  };
});
