import { getRouterParam, setResponseStatus } from "h3";

import { proxyCourseServiceJson } from "~/server/utils/course-service-proxy";
import type { AdminCourseAuthoringResponse } from "~/shared/types/course-authoring";

export default defineEventHandler(async (event) => {
  const courseId = getRouterParam(event, "courseId");

  if (!courseId) {
    setResponseStatus(event, 400, "Bad Request");
    return {
      detail: "course_id is required",
      status: 400,
      title: "Bad Request",
      type: "/problems/validation"
    };
  }

  return await proxyCourseServiceJson<AdminCourseAuthoringResponse>(
    event,
    `/v1/admin/courses/${encodeURIComponent(courseId)}/authoring`
  );
});
