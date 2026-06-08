import { describe, expect, it } from "vitest";

import { hasStudioAccess } from "~/features/auth";
import type { AuthMe, AuthRole } from "~/features/auth";

function userWithRoles(roles: AuthRole[]): AuthMe {
  return {
    account_id: "account-1",
    email: "user@example.com",
    roles,
    status: "active",
    user_id: "user-1"
  };
}

describe("hasStudioAccess", () => {
  it("allows studio staff roles", () => {
    expect(hasStudioAccess(userWithRoles(["admin"]))).toBe(true);
    expect(hasStudioAccess(userWithRoles(["teacher"]))).toBe(true);
    expect(hasStudioAccess(userWithRoles(["content_manager"]))).toBe(true);
  });

  it("denies public application roles", () => {
    expect(hasStudioAccess(userWithRoles(["parent"]))).toBe(false);
    expect(hasStudioAccess(userWithRoles(["student"]))).toBe(false);
    expect(hasStudioAccess(null)).toBe(false);
  });
});
