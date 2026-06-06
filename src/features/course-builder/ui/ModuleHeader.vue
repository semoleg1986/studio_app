<template>
  <header class="module-head">
    <button
      type="button"
      class="node-button"
      @click="$emit('update:selectedNode', { type: 'module', moduleId: module.module_id })"
    >
      <span class="drag-handle">⠿</span>
      <strong>{{ module.position }}. {{ module.title }}</strong>
      <small>{{ module.lessons.length }} урока</small>
      <span class="collapse-mark">⌃</span>
    </button>
    <div class="node-actions">
      <span class="state-chip node-state" :data-state="module.status">
        {{ stateLabel(module.status) }}
      </span>
      <button
        v-if="module.status !== 'published' && module.status !== 'archived'"
        class="action-pill"
        type="button"
        :disabled="mutating"
        @click.stop="$emit('publish-module', module)"
      >
        Опубликовать
      </button>
      <button
        v-if="module.status === 'archived'"
        class="action-pill action-pill--restore"
        type="button"
        :disabled="mutating"
        @click.stop="$emit('restore-module', module)"
      >
        Вернуть
      </button>
      <button
        type="button"
        :disabled="mutating"
        @click.stop="$emit('move-module', module.module_id, -1)"
      >
        ↑
      </button>
      <button
        type="button"
        :disabled="mutating"
        @click.stop="$emit('move-module', module.module_id, 1)"
      >
        ↓
      </button>
      <button
        type="button"
        :disabled="mutating"
        @click.stop="$emit('duplicate-module', module.module_id)"
      >
        ⧉
      </button>
      <button
        class="danger-link action-pill"
        type="button"
        :disabled="mutating || module.status === 'archived'"
        @click.stop="$emit('archive-module', module.module_id)"
      >
        В архив
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import type {
  CourseBuilderSelectedNode,
  StudioCourseModule
} from "~/features/course-builder/model/types";
import type { CoursePublishState } from "~/shared/types/course-authoring";

defineEmits<{
  "archive-module": [moduleId: string];
  "duplicate-module": [moduleId: string];
  "move-module": [moduleId: string, direction: -1 | 1];
  "publish-module": [module: StudioCourseModule];
  "restore-module": [module: StudioCourseModule];
  "update:selectedNode": [node: CourseBuilderSelectedNode];
}>();

defineProps<{
  module: StudioCourseModule;
  mutating: boolean;
}>();

function stateLabel(state: CoursePublishState) {
  const labels: Record<string, string> = {
    archived: "Архив",
    draft: "Черновик",
    published: "Опубликовано"
  };
  return labels[state] ?? state;
}
</script>

<style scoped>
.module-head,
.node-actions {
  display: flex;
  align-items: center;
}

.module-head {
  gap: 0.6rem;
  padding: 0.52rem 0.65rem;
  background: color-mix(in srgb, var(--studio-panel-3) 50%, transparent);
}

.node-button {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: 26px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.65rem;
  border: 0;
  background: transparent;
  color: var(--studio-text);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.node-button strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-button small {
  color: var(--studio-muted);
}

.drag-handle,
.collapse-mark {
  color: var(--studio-dim);
}

.node-actions {
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.32rem;
}

.node-actions button,
.state-chip {
  border: 1px solid var(--studio-line);
  background: var(--studio-control-bg);
  color: var(--studio-muted);
}

.node-actions button {
  display: grid;
  min-width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 8px;
  padding: 0 0.42rem;
}

.node-actions .action-pill {
  min-width: auto;
  padding-inline: 0.62rem;
  white-space: nowrap;
}

.node-actions .danger-link {
  border-color: rgb(237 138 125 / 0.24);
  color: var(--studio-danger);
}

.node-actions .action-pill--restore {
  border-color: rgb(137 220 230 / 0.36);
  color: var(--studio-accent);
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

.node-state {
  white-space: nowrap;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 760px) {
  .node-button {
    grid-template-columns: 24px minmax(0, 1fr);
  }
}
</style>
