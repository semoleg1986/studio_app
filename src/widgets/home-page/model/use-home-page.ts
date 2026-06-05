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

  return { t };
}
