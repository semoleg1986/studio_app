import { describe, expect, it } from "vitest";
import { translate } from "~/shared/lib/preferences/messages";

describe("translate", () => {
  it("returns locale value by key", () => {
    expect(translate("en", "settings.theme")).toBe("Theme");
    expect(translate("ru", "settings.theme")).toBe("Тема");
  });

  it("falls back to russian value for unknown locale key", () => {
    expect(translate("en", "footer.unknown.key")).toBe("footer.unknown.key");
    expect(translate("en", "catalog.title")).toBe("Courses in production");
  });
});
