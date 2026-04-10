<template>
  <main class="page">
    <HeroBanner
      :title="t('page.hero.title')"
      :subtitle="t('page.hero.subtitle')"
    />
    <p class="status">{{ t("page.status") }}: {{ t(`status.${status}`) }}</p>
    <CourseCatalogSection />
  </main>
</template>

<script setup lang="ts">
import CourseCatalogSection from "~/features/course-catalog/ui/CourseCatalogSection.vue";
import { useHealthQuery } from "~/shared/api/health";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";
import { buildCourseTitle } from "~/shared/lib/seo/build-course-title";
import HeroBanner from "~/shared/ui/hero-banner/HeroBanner.vue";

const { t } = usePreferences();

const title = computed(() => buildCourseTitle(t("page.hero.title")));

useSeoMeta({
  title,
  description: "Студия контента для редакторов и преподавателей.",
  ogTitle: title,
  ogDescription: "Студия создания контента образовательной платформы."
});

const { data } = await useHealthQuery();
const status = computed(() => (data.value?.ok ? "ok" : "degraded"));
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
}

.status {
  margin-top: 1rem;
  font-weight: 600;
}
</style>
