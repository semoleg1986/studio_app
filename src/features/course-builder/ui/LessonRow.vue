<template>
  <div
    :class="[
      'lesson-row',
      {
        active: selected
      }
    ]"
  >
    <button type="button" class="lesson-item" @click="$emit('select')">
      <span class="lesson-position">{{ modulePosition }}.{{ lesson.position }}</span>
      <strong>{{ lesson.title }}</strong>
      <small class="lesson-type">{{ contentTypeLabel(lesson.content_type) }}</small>
      <small class="state-chip lesson-state" :data-state="lesson.status">
        {{ stateLabel(lesson.status) }}
      </small>
      <small>{{ lesson.duration_minutes ?? "—" }} мин</small>
      <span class="lesson-status">✓</span>
    </button>
    <div class="lesson-actions">
      <button type="button" :disabled="mutating" @click.stop="$emit('move', -1)">↑</button>
      <button type="button" :disabled="mutating" @click.stop="$emit('move', 1)">↓</button>
      <button type="button" :disabled="mutating" @click.stop="$emit('duplicate')">⧉</button>
      <button
        class="danger-link action-pill"
        type="button"
        :disabled="mutating || lesson.status === 'archived'"
        @click.stop="$emit('archive')"
      >
        В архив
      </button>
      <button
        v-if="lesson.status === 'archived'"
        class="action-pill action-pill--restore"
        type="button"
        :disabled="mutating"
        @click.stop="$emit('restore')"
      >
        Вернуть
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudioCourseLesson } from "~/features/course-builder/model/types";
import type { CoursePublishState } from "~/shared/types/course-authoring";

defineEmits<{
  archive: [];
  duplicate: [];
  move: [direction: -1 | 1];
  restore: [];
  select: [];
}>();

defineProps<{
  lesson: StudioCourseLesson;
  modulePosition: number;
  mutating: boolean;
  selected: boolean;
}>();

function stateLabel(state: CoursePublishState) {
  const labels: Record<string, string> = {
    archived: "Архив",
    draft: "Черновик",
    published: "Опубликовано"
  };
  return labels[state] ?? state;
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
.lesson-row,
.lesson-actions {
  display: flex;
  align-items: center;
}

.lesson-row {
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 160ms ease;
}

.lesson-row.active {
  border-color: rgb(137 220 230 / 0.35);
  background: rgb(137 220 230 / 0.08);
}

.lesson-item {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: 48px minmax(0, 1fr) auto auto 58px 22px;
  align-items: center;
  gap: 0.55rem;
  border: 0;
  background: transparent;
  color: var(--studio-text);
  cursor: pointer;
  font: inherit;
  padding: 0.58rem 0.65rem;
  text-align: left;
}

.lesson-item strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lesson-position,
.lesson-status {
  color: var(--studio-muted);
  font-weight: 950;
}

.lesson-type {
  border-radius: 999px;
  background: rgb(137 220 230 / 0.12);
  color: var(--studio-accent);
  padding: 0.22rem 0.48rem;
}

.lesson-actions {
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.32rem;
}

.lesson-actions button {
  display: grid;
  min-width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid var(--studio-line);
  border-radius: 8px;
  background: rgb(0 0 0 / 0.12);
  color: var(--studio-muted);
  padding: 0 0.42rem;
}

.lesson-actions .action-pill {
  min-width: auto;
  padding-inline: 0.62rem;
  white-space: nowrap;
}

.lesson-actions .danger-link {
  border-color: rgb(237 138 125 / 0.24);
  color: var(--studio-danger);
}

.lesson-actions .action-pill--restore {
  border-color: rgb(137 220 230 / 0.36);
  color: var(--studio-accent);
}

.state-chip {
  border: 1px solid var(--studio-line);
  border-radius: 999px;
  background: rgb(0 0 0 / 0.12);
  color: var(--studio-muted);
  font-size: 0.78rem;
  font-weight: 950;
  padding: 0.32rem 0.64rem;
}

.state-chip[data-state="published"] {
  color: var(--studio-success);
}

.state-chip[data-state="archived"] {
  color: var(--studio-dim);
}

.lesson-state {
  white-space: nowrap;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 760px) {
  .lesson-item {
    grid-template-columns: 1fr;
  }
}
</style>
