import { getQuery } from "h3";

import { proxyCourseServiceJson } from "~/server/utils/course-service-proxy";
import type { AdminCourseListResponse } from "~/shared/types/course-authoring";

export default defineEventHandler(async (event) => {
  return await proxyCourseServiceJson<AdminCourseListResponse>(event, "/v1/admin/courses", {
    query: getQuery(event)
  });
});
