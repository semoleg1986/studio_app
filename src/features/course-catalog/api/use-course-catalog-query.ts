import { useApiQuery } from "~/shared/api/use-api-query";
import type { StudioCourseListResponse } from "~/features/course-catalog/model/types";

const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

export function useCourseCatalogQuery() {
  return useApiQuery<StudioCourseListResponse>("/admin/courses", {
    query: {
      limit: DEFAULT_LIMIT,
      offset: DEFAULT_OFFSET
    }
  });
}
