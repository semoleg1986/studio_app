import { describe, expect, it } from "vitest";

import { buildCourseServiceUrl } from "~/server/utils/course-service-proxy";

describe("course service proxy helpers", () => {
  it("builds course service urls with filtered query params", () => {
    const url = buildCourseServiceUrl("http://course_service:8001/", "/v1/admin/courses", {
      empty: "",
      limit: 25,
      offset: 0,
      publish_state: "draft"
    });

    expect(url).toBe(
      "http://course_service:8001/v1/admin/courses?limit=25&offset=0&publish_state=draft"
    );
  });
});
