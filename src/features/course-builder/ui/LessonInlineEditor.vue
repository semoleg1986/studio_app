<template>
  <aside class="lesson-drawer lesson-drawer--inline">
    <h2>Урок {{ modulePosition }}.{{ lessonPosition }}</h2>
    <label class="field">
      <span>Название урока</span>
      <input
        :value="lesson.title"
        @input="updateLesson('title', ($event.target as HTMLInputElement).value)"
      />
    </label>
    <label class="field">
      <span>Тип урока</span>
      <div class="input-shell input-shell--select">
        <b>▧</b>
        <select
          :value="lesson.content_type"
          @change="updateLesson('content_type', ($event.target as HTMLSelectElement).value)"
        >
          <option value="video">Видео</option>
          <option value="text">Текст</option>
          <option value="quiz">Quiz</option>
          <option value="live">Live</option>
        </select>
      </div>
    </label>
    <label class="field">
      <span>Длительность</span>
      <div class="duration-field">
        <input
          :value="lesson.duration_minutes ?? ''"
          min="1"
          type="number"
          @input="
            updateLesson(
              'duration_minutes',
              Number(($event.target as HTMLInputElement).value) || null
            )
          "
        />
        <span>мин</span>
      </div>
    </label>
    <label class="field">
      <span>Описание</span>
      <textarea
        :value="lesson.description ?? ''"
        @input="updateLesson('description', ($event.target as HTMLTextAreaElement).value || null)"
      />
    </label>
    <label class="check-row">
      <input
        :checked="lesson.is_preview"
        type="checkbox"
        @change="updateLesson('is_preview', ($event.target as HTMLInputElement).checked)"
      />
      Preview урок
    </label>
    <div class="lesson-editor-actions">
      <button
        v-if="lesson.status !== 'published'"
        class="ghost-action"
        type="button"
        :disabled="mutating || lesson.status === 'archived'"
        @click="$emit('publish')"
      >
        Опубликовать урок
      </button>
      <button
        v-if="lesson.status === 'archived'"
        class="ghost-action"
        type="button"
        :disabled="mutating"
        @click="$emit('restore')"
      >
        Вернуть урок
      </button>
      <button
        class="danger-action"
        type="button"
        :disabled="mutating || lesson.status === 'archived'"
        @click="$emit('archive')"
      >
        В архив
      </button>
      <button class="primary-action" type="button" :disabled="mutating" @click="$emit('save')">
        Сохранить урок
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { StudioCourseLesson } from "~/features/course-builder/model/types";

type LessonPatch = Partial<
  Pick<
    StudioCourseLesson,
    "content_type" | "description" | "duration_minutes" | "is_preview" | "title"
  >
>;

const emit = defineEmits<{
  archive: [];
  publish: [];
  restore: [];
  save: [];
  "update:lesson": [patch: LessonPatch];
}>();

defineProps<{
  lesson: StudioCourseLesson;
  lessonPosition: number;
  modulePosition: number;
  mutating: boolean;
}>();

function updateLesson<K extends keyof LessonPatch>(key: K, value: NonNullable<LessonPatch[K]>) {
  emit("update:lesson", { [key]: value } as LessonPatch);
}
</script>

<style scoped>
.lesson-drawer {
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid var(--studio-line);
  border-radius: 16px;
  background: color-mix(in srgb, var(--studio-panel-2) 82%, transparent);
}

.lesson-drawer--inline {
  margin: 0.48rem 0.65rem 0.9rem 3.2rem;
  box-shadow: 0 18px 48px rgb(0 0 0 / 0.18);
}

.lesson-drawer h2 {
  margin: 0;
  color: var(--studio-text);
  font-size: 1.25rem;
  font-weight: 950;
  letter-spacing: -0.035em;
}

.field {
  display: grid;
  gap: 0.46rem;
}

.field span,
.field small,
.duration-field span {
  color: var(--studio-muted);
}

.input-shell,
.duration-field {
  border: 1px solid var(--studio-line);
  border-radius: 12px;
  background: rgb(0 0 0 / 0.12);
}

.input-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  padding-right: 0.72rem;
}

.input-shell--select {
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.65rem;
  padding: 0 0.78rem;
}

.input-shell b {
  color: var(--studio-accent);
  font-style: normal;
}

.duration-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  padding-right: 0.8rem;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--studio-muted);
  font-weight: 900;
}

.lesson-editor-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.55rem;
}

.lesson-editor-actions .primary-action,
.lesson-editor-actions .ghost-action,
.lesson-editor-actions .danger-action {
  width: auto;
}

.primary-action,
.ghost-action,
.danger-action {
  min-height: 42px;
  border-radius: 12px;
  padding: 0 1rem;
  font-weight: 950;
}

.primary-action {
  border: 0;
  background: linear-gradient(135deg, var(--studio-accent), var(--studio-accent-2));
  color: #082024;
}

.ghost-action,
.danger-action {
  border: 1px solid var(--studio-line);
  background: rgb(0 0 0 / 0.12);
  color: var(--studio-muted);
}

.danger-action {
  border-color: rgb(237 138 125 / 0.24);
  color: var(--studio-danger);
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: rgb(0 0 0 / 0.12);
  color: var(--studio-text);
  font: inherit;
  font-weight: 850;
  outline: none;
  padding: 0.78rem 0.9rem;
}

.input-shell input,
.input-shell select,
.duration-field input {
  border: 0;
  background: transparent;
}

textarea {
  min-height: 84px;
  resize: vertical;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 760px) {
  .lesson-drawer--inline {
    margin-left: 0;
  }
}
</style>
