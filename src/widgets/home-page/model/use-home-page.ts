import { useCourseCatalog } from "~/features/course-catalog";
import { useHealthQuery } from "~/shared/api/health";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";
import { buildCourseTitle } from "~/shared/lib/seo/build-course-title";

export async function useHomePage() {
  const { t } = usePreferences();

  const title = computed(() => buildCourseTitle(t("page.hero.title")));

  useSeoMeta({
    title,
    description: "Студия контента для редакторов и преподавателей.",
    ogTitle: title,
    ogDescription: "Студия создания контента образовательной платформы."
  });

  const { data: health } = await useHealthQuery();
  const status = computed(() => (health.value?.ok ? "ok" : "degraded"));
  const { courses } = await useCourseCatalog();

  return {
    courses,
    status,
    t
  };
}
