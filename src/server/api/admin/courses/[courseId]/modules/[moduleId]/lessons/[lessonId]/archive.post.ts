import { getRouterParam, setResponseStatus } from "h3";

import { proxyCourseServiceJson } from "~/server/utils/course-service-proxy";
import type { CourseResponse } from "~/shared/types/course-authoring";

export default defineEventHandler(async (event) => {
  const courseId = getRouterParam(event, "courseId");
  const moduleId = getRouterParam(event, "moduleId");
  const lessonId = getRouterParam(event, "lessonId");

  if (!courseId || !moduleId || !lessonId) {
    setResponseStatus(event, 400, "Bad Request");
    return {
      detail: "course_id, module_id and lesson_id are required",
      status: 400,
      title: "Bad Request",
      type: "/problems/validation"
    };
  }

  return await proxyCourseServiceJson<CourseResponse>(
    event,
    `/v1/admin/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons/${encodeURIComponent(lessonId)}/archive`,
    { method: "POST" }
  );
});
