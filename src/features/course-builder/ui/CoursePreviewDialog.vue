<template>
  <div
    v-if="open && authoring"
    class="preview-backdrop"
    role="presentation"
    @click="$emit('close')"
  >
    <section
      class="preview-dialog"
      aria-label="Предпросмотр курса"
      role="dialog"
      aria-modal="true"
      @click.stop
    >
      <header class="preview-head">
        <div>
          <span class="eyebrow">Предпросмотр</span>
          <h2>{{ authoring.course.title }}</h2>
          <p>{{ authoring.course.description || "Описание курса пока не заполнено." }}</p>
        </div>
        <button type="button" aria-label="Закрыть предпросмотр" @click="$emit('close')">×</button>
      </header>

      <div class="preview-meta">
        <span>{{ levelLabel(authoring.course.level) }}</span>
        <span>{{ visibleLessonsCount }} уроков</span>
        <span>Цена настраивается в offer</span>
      </div>

      <div class="preview-body">
        <section class="preview-card hero-card">
          <span class="hero-mark">C</span>
          <div>
            <strong>{{ authoring.course.title }}</strong>
            <small>Так курс будет выглядеть в learner-facing структуре.</small>
          </div>
        </section>

        <section class="preview-card">
          <h3>Структура курса</h3>
          <ol v-if="visibleModules.length" class="module-preview-list">
            <li v-for="module in visibleModules" :key="module.module_id">
              <header>
                <strong>{{ module.position }}. {{ module.title }}</strong>
                <span>{{ visibleLessons(module).length }} уроков</span>
              </header>
              <p v-if="module.description">{{ module.description }}</p>
              <ol>
                <li v-for="lesson in visibleLessons(module)" :key="lesson.lesson_id">
                  <span>{{ module.position }}.{{ lesson.position }}</span>
                  <strong>{{ lesson.title }}</strong>
                  <small>{{ contentTypeLabel(lesson.content_type) }}</small>
                  <small>{{ lesson.duration_minutes ?? "—" }} мин</small>
                </li>
              </ol>
            </li>
          </ol>
          <p v-else class="empty-preview">Добавьте модуль и уроки, чтобы увидеть структуру.</p>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type {
  StudioCourseAuthoring,
  StudioCourseModule
} from "~/features/course-builder/model/types";

defineEmits<{ close: [] }>();

const props = defineProps<{
  authoring: StudioCourseAuthoring | null;
  open: boolean;
}>();

const visibleModules = computed(
  () => props.authoring?.modules.filter((module) => module.status !== "archived") ?? []
);

const visibleLessonsCount = computed(() =>
  visibleModules.value.reduce((count, module) => count + visibleLessons(module).length, 0)
);

function visibleLessons(module: StudioCourseModule) {
  return module.lessons.filter((lesson) => lesson.status !== "archived");
}

function levelLabel(value: string) {
  const labels: Record<string, string> = {
    advanced: "Продвинутый",
    beginner: "Начальный",
    intermediate: "Средний"
  };
  return labels[value] ?? value;
}

function contentTypeLabel(value: string) {
  const labels: Record<string, string> = {
    live: "Live",
    quiz: "Quiz",
    text: "Текст",
    video: "Видео"
  };
  return labels[value] ?? value;
}
</script>

<style scoped>
.preview-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgb(3 11 14 / 0.42);
  backdrop-filter: blur(14px);
}

.preview-dialog {
  display: grid;
  width: min(980px, 100%);
  max-height: min(860px, 92dvh);
  overflow: auto;
  border: 1px solid var(--studio-line-strong);
  border-radius: 24px;
  background:
    radial-gradient(circle at 80% 0%, rgb(137 220 230 / 0.16), transparent 32%), var(--studio-panel);
  box-shadow: var(--studio-shadow);
  color: var(--studio-text);
}

.preview-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  padding: 1.4rem;
  border-bottom: 1px solid var(--studio-line);
}

.preview-head h2,
.preview-head p {
  margin: 0;
}

.preview-head h2 {
  margin-top: 0.25rem;
  font-size: clamp(1.8rem, 4vw, 3rem);
  letter-spacing: -0.06em;
}

.preview-head p {
  max-width: 64ch;
  color: var(--studio-muted);
}

.preview-head button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--studio-line);
  border-radius: 14px;
  background: var(--studio-control-bg);
  color: var(--studio-text);
  cursor: pointer;
  font: inherit;
  font-size: 1.4rem;
  font-weight: 950;
}

.eyebrow {
  color: var(--studio-accent);
  font-size: 0.78rem;
  font-weight: 1000;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 1rem 1.4rem 0;
}

.preview-meta span {
  border: 1px solid var(--studio-line);
  border-radius: 999px;
  background: var(--studio-control-bg);
  color: var(--studio-muted);
  font-weight: 950;
  padding: 0.42rem 0.72rem;
}

.preview-body {
  display: grid;
  gap: 1rem;
  padding: 1.4rem;
}

.preview-card {
  border: 1px solid var(--studio-line);
  border-radius: 18px;
  background: color-mix(in srgb, var(--studio-control-bg-strong) 76%, transparent);
  padding: 1.1rem;
}

.hero-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hero-card strong,
.preview-card h3 {
  color: var(--studio-text);
  font-size: 1.2rem;
  font-weight: 1000;
}

.hero-card small,
.module-preview-list p,
.module-preview-list small,
.module-preview-list header span,
.empty-preview {
  color: var(--studio-muted);
}

.hero-mark {
  display: grid;
  width: 56px;
  height: 56px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(135deg, #9ce7ee, #c7a16f);
  color: #0a171c;
  font-weight: 1000;
}

.module-preview-list,
.module-preview-list ol {
  display: grid;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.module-preview-list > li {
  display: grid;
  gap: 0.6rem;
  border-top: 1px solid var(--studio-line);
  padding-top: 0.9rem;
}

.module-preview-list header,
.module-preview-list ol li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.7rem;
  align-items: center;
}

.module-preview-list ol li {
  grid-template-columns: 52px minmax(0, 1fr) auto auto;
  border: 1px solid var(--studio-line);
  border-radius: 12px;
  background: var(--studio-control-bg);
  padding: 0.72rem;
}

@media (max-width: 720px) {
  .preview-backdrop {
    align-items: stretch;
    padding: 0;
  }

  .preview-dialog {
    max-height: 100dvh;
    border-radius: 0;
  }

  .module-preview-list ol li {
    grid-template-columns: 1fr;
  }
}
</style>
