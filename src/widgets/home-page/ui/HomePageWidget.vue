<template>
  <main class="page">
    <HeroBanner :title="t('page.hero.title')" :subtitle="t('page.hero.subtitle')" />
    <p class="status">
      <span>{{ t("page.status") }}</span>
      <strong>{{ t(`status.${status}`) }}</strong>
    </p>
    <CourseCatalogSection
      :courses="courses"
      :error-message="coursesErrorMessage"
      :pending="coursesPending"
      :total="total"
      :unauthorized="coursesUnauthorized"
      @refresh="refreshCourses"
    />
  </main>
</template>

<script setup lang="ts">
import { CourseCatalogSection } from "~/features/course-catalog";
import HeroBanner from "~/shared/ui/hero-banner/HeroBanner.vue";
import { useHomePage } from "~/widgets/home-page/model/use-home-page";

const {
  courses,
  coursesErrorMessage,
  coursesPending,
  coursesUnauthorized,
  refreshCourses,
  status,
  t,
  total
} = useHomePage();
</script>

<style scoped>
.page {
  width: min(1180px, calc(100% - 2rem));
  max-width: 1180px;
  margin: 0 auto;
  padding: 2rem 0;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0 0;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--panel);
  color: var(--muted);
  font-size: 0.84rem;
  font-weight: 700;
}

.status strong {
  color: var(--text);
}
</style>
