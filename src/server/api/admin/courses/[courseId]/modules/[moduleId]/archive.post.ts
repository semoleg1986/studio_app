import { getRouterParam, setResponseStatus } from "h3";

import { proxyCourseServiceJson } from "~/server/utils/course-service-proxy";
import type { CourseResponse } from "~/shared/types/course-authoring";

export default defineEventHandler(async (event) => {
  const courseId = getRouterParam(event, "courseId");
  const moduleId = getRouterParam(event, "moduleId");

  if (!courseId || !moduleId) {
    setResponseStatus(event, 400, "Bad Request");
    return {
      detail: "course_id and module_id are required",
      status: 400,
      title: "Bad Request",
      type: "/problems/validation"
    };
  }

  return await proxyCourseServiceJson<CourseResponse>(
    event,
    `/v1/admin/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/archive`,
    { method: "POST" }
  );
});
