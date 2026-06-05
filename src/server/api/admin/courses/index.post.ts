import { proxyCourseServiceJson } from "~/server/utils/course-service-proxy";
import type { CourseResponse } from "~/shared/types/course-authoring";

export default defineEventHandler(async (event) => {
  return await proxyCourseServiceJson<CourseResponse>(event, "/v1/admin/courses", {
    method: "POST"
  });
});
