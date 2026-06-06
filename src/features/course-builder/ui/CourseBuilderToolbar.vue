<template>
  <header class="workspace-toolbar">
    <div class="breadcrumbs">
      <span>Курсы</span>
      <span>›</span>
      <strong>{{ selectedCourse?.title ?? "Новый курс" }}</strong>
      <span v-if="selectedCourse" class="state-chip" :data-state="selectedCourse.publish_state">
        {{ stateLabel(selectedCourse.publish_state) }}
      </span>
    </div>
    <div class="toolbar-actions">
      <span v-if="lastSavedAt" class="save-state">✓ Сохранено {{ formatTime(lastSavedAt) }}</span>
      <span v-else class="save-state">{{ mutating ? "Сохраняем..." : "Сохранено" }}</span>
      <button class="activity-button" type="button" title="Состояние">⌁</button>
      <div class="history-buttons" aria-hidden="true">
        <button type="button" disabled>↶</button>
        <button type="button" disabled>↷</button>
      </div>
      <button
        class="ghost-action"
        type="button"
        :disabled="!selectedCourse"
        @click="$emit('preview')"
      >
        Предпросмотр
      </button>
      <button
        class="primary-action toolbar-publish"
        type="button"
        :disabled="mutating || !readyToPublish"
        @click="$emit('publish')"
      >
        Опубликовать
      </button>
      <button class="menu-button" type="button">⋮</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { StudioCourse } from "~/features/course-builder/model/types";
import type { CoursePublishState } from "~/shared/types/course-authoring";

defineEmits<{
  preview: [];
  publish: [];
}>();

defineProps<{
  lastSavedAt: string | null;
  mutating: boolean;
  readyToPublish: boolean;
  selectedCourse: StudioCourse | null;
}>();

function stateLabel(state: CoursePublishState) {
  const labels: Record<string, string> = {
    archived: "Архив",
    draft: "Черновик",
    published: "Опубликовано"
  };
  return labels[state] ?? state;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
</script>

<style scoped>
.workspace-toolbar {
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1.4rem;
  border-bottom: 1px solid var(--studio-line);
  background: color-mix(in srgb, var(--studio-bg) 82%, transparent);
}

.breadcrumbs,
.toolbar-actions,
.history-buttons {
  display: flex;
  align-items: center;
}

.breadcrumbs {
  gap: 0.58rem;
  color: var(--studio-muted);
  font-weight: 900;
}

.breadcrumbs strong {
  color: var(--studio-text);
  font-size: 1.08rem;
}

.toolbar-actions {
  gap: 0.7rem;
}

.save-state {
  color: var(--studio-muted);
  font-size: 0.86rem;
  white-space: nowrap;
}

.state-chip,
.ghost-action,
.history-buttons button,
.menu-button,
.activity-button {
  border: 1px solid var(--studio-line);
  background: var(--studio-control-bg);
  color: var(--studio-muted);
}

.state-chip {
  border-radius: 999px;
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

.activity-button,
.menu-button,
.history-buttons button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  font-weight: 950;
}

.history-buttons {
  overflow: hidden;
  border: 1px solid var(--studio-line);
  border-radius: 13px;
}

.history-buttons button {
  border: 0;
  border-radius: 0;
  background: var(--studio-control-bg);
}

.history-buttons button:last-child {
  border-left: 1px solid var(--studio-line);
}

.ghost-action,
.primary-action {
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

.primary-action:disabled,
.ghost-action:disabled,
.history-buttons button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 1180px) {
  .workspace-toolbar {
    align-items: flex-start;
    flex-direction: column;
    padding: 1rem;
  }

  .toolbar-actions {
    flex-wrap: wrap;
  }
}
</style>
