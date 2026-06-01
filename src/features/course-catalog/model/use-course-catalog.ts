import { useCourseCatalogQuery } from "~/features/course-catalog/api/use-course-catalog-query";

export function useCourseCatalog() {
  const { apiError, data, error, pending, refresh } = useCourseCatalogQuery();
  const courses = computed(() => data.value?.items ?? []);
  const total = computed(() => data.value?.total ?? courses.value.length);

  return {
    apiError,
    courses,
    data,
    error,
    pending,
    refresh,
    total
  };
}
