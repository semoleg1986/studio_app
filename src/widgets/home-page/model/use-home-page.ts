import { useCourseCatalog } from "~/features/course-catalog";
import { useAuthSession } from "~/features/auth";
import { useHealthQuery } from "~/shared/api/health";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";
import { buildCourseTitle } from "~/shared/lib/seo/build-course-title";

export function useHomePage() {
  const { t } = usePreferences();

  const title = computed(() => buildCourseTitle(t("page.hero.title")));

  useSeoMeta({
    title,
    description: "Студия контента для редакторов и преподавателей.",
    ogTitle: title,
    ogDescription: "Студия создания контента образовательной платформы."
  });

  const { data: health } = useHealthQuery();
  const status = computed(() => (health.value?.ok ? "ok" : "degraded"));
  const { initialized, isAuthenticated } = useAuthSession();
  const coursesEnabled = computed(() => initialized.value && isAuthenticated.value);
  const { apiError, courses, pending, refresh, total } = useCourseCatalog(coursesEnabled);
  const coursesErrorMessage = computed(() => apiError.value?.statusMessage ?? "");
  const coursesUnauthorized = computed(
    () => initialized.value && !isAuthenticated.value && !coursesEnabled.value
  );

  return {
    courses,
    coursesErrorMessage,
    coursesUnauthorized,
    coursesPending: computed(() => !initialized.value || pending.value),
    refreshCourses: refresh,
    status,
    t,
    total
  };
}
