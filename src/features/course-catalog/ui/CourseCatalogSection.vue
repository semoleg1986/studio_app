<template>
  <section class="catalog">
    <header class="catalog__header">
      <div>
        <p class="eyebrow">{{ t("catalog.eyebrow") }}</p>
        <h2>{{ t("catalog.title") }}</h2>
        <p class="summary">{{ t("catalog.total") }}: {{ total }}</p>
      </div>
      <button
        class="refresh"
        type="button"
        :disabled="unauthorized || pending"
        @click="$emit('refresh')"
      >
        {{ t("catalog.refresh") }}
      </button>
    </header>

    <UiCard v-if="unauthorized" class="auth-card" max-width="100%">
      <h3>{{ t("catalog.auth.title") }}</h3>
      <p>{{ t("catalog.auth.text") }}</p>
      <UiButton as="NuxtLink" to="/login">
        {{ t("catalog.auth.action") }}
      </UiButton>
    </UiCard>
    <p v-else-if="pending" class="empty">{{ t("catalog.loading") }}</p>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
    <ul v-else-if="courses.length > 0" class="grid">
      <li v-for="course in courses" :key="course.course_id" class="card">
        <div class="card__topline">
          <span class="state">{{ formatPublishState(course.publish_state) }}</span>
          <span class="version">v{{ course.version }}</span>
        </div>
        <h3>{{ course.title }}</h3>
        <p class="muted">{{ course.slug }}</p>
        <dl class="meta">
          <div>
            <dt>{{ t("catalog.teacher") }}</dt>
            <dd>{{ course.teacher_display_name || course.teacher_id }}</dd>
          </div>
          <div>
            <dt>{{ t("catalog.modules") }}</dt>
            <dd>{{ course.modules_count }}</dd>
          </div>
          <div>
            <dt>{{ t("catalog.lessons") }}</dt>
            <dd>{{ course.lessons_total }}</dd>
          </div>
          <div>
            <dt>{{ t("catalog.price") }}</dt>
            <dd>{{ formatMoney(course.price, course.currency) }}</dd>
          </div>
        </dl>
        <p class="updated">{{ t("catalog.updated") }}: {{ formatDate(course.updated_at) }}</p>
      </li>
    </ul>
    <p v-else class="empty">{{ t("catalog.empty") }}</p>
  </section>
</template>

<script setup lang="ts">
import type { StudioCourseListItem } from "~/features/course-catalog/model/types";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";
import UiButton from "~/shared/ui/UiButton.vue";
import UiCard from "~/shared/ui/UiCard.vue";

const props = defineProps<{
  courses: StudioCourseListItem[];
  errorMessage?: string;
  pending?: boolean;
  total: number;
  unauthorized?: boolean;
}>();

defineEmits<{
  refresh: [];
}>();

const { locale, t } = usePreferences();

function formatPublishState(state: string) {
  return t(`catalog.state.${state}`);
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat(locale.value, {
    currency,
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

const total = computed(() => props.total);
</script>

<style scoped>
.catalog {
  margin-top: 2rem;
}

.auth-card {
  display: grid;
  gap: 0.75rem;
}

.auth-card h3,
.auth-card p {
  margin: 0;
}

.auth-card p {
  color: var(--muted);
}

.catalog__header {
  align-items: flex-end;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.eyebrow,
.summary,
.muted,
.updated {
  color: var(--c-muted);
}

.eyebrow {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0 0 0.3rem;
  text-transform: uppercase;
}

h2,
h3 {
  margin: 0;
}

.summary {
  margin: 0.35rem 0 0;
}

.refresh {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  color: var(--c-text);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 0.65rem 1rem;
}

.refresh:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  list-style: none;
  padding: 0;
}

.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 18px;
  padding: 1rem;
}

.card__topline,
.meta {
  align-items: center;
  display: flex;
  gap: 0.75rem;
}

.card__topline {
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.state,
.version {
  border: 1px solid var(--c-border);
  border-radius: 999px;
  color: var(--c-muted);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.3rem 0.55rem;
}

.meta {
  flex-wrap: wrap;
  margin: 1rem 0;
}

.meta div {
  background: var(--c-bg-soft);
  border-radius: 12px;
  min-width: 120px;
  padding: 0.65rem 0.75rem;
}

dt,
dd {
  margin: 0;
}

dt {
  color: var(--c-muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

dd {
  font-weight: 800;
  margin-top: 0.25rem;
}

.empty,
.error {
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 1rem;
}

.empty {
  color: var(--c-muted);
}

.error {
  color: var(--c-danger, #b42318);
}

@media (max-width: 640px) {
  .catalog__header {
    align-items: stretch;
    flex-direction: column;
  }

  .refresh {
    width: 100%;
  }
}
</style>
