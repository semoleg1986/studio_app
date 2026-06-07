import { getRouterParam, setResponseStatus } from "h3";

import { proxyCommercialCatalogJson } from "~/server/utils/commercial-catalog-proxy";
import { proxyCourseServiceJson } from "~/server/utils/course-service-proxy";
import type { StudioCourseOffersResponse } from "~/shared/types/course-authoring";

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

  const authoringAccess = await proxyCourseServiceJson<Record<string, unknown>>(
    event,
    `/v1/admin/courses/${encodeURIComponent(courseId)}/authoring`
  );

  if (typeof authoringAccess.status === "number" && authoringAccess.status >= 400) {
    return authoringAccess;
  }

  return await proxyCommercialCatalogJson<StudioCourseOffersResponse>(
    event,
    `/internal/v1/courses/${encodeURIComponent(courseId)}/offers`
  );
});
