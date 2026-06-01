import { useCourseCatalogQuery } from "~/features/course-catalog/api/use-course-catalog-query";

export function useCourseCatalog(enabled = ref(true)) {
  const { apiError, data, error, pending, refresh } = useCourseCatalogQuery();
  const courses = computed(() => data.value?.items ?? []);
  const hasLoaded = ref(false);
  const total = computed(() => data.value?.total ?? courses.value.length);
  const displayPending = computed(() => enabled.value && (pending.value || !hasLoaded.value));

  watch(
    enabled,
    async (isEnabled) => {
      if (!isEnabled) {
        return;
      }
      await refresh();
      hasLoaded.value = true;
    },
    { immediate: true }
  );

  return {
    apiError,
    courses,
    data,
    error,
    pending: displayPending,
    refresh,
    total
  };
}
