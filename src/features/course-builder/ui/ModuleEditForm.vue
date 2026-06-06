<template>
  <div class="module-edit">
    <input
      :value="module.title"
      @input="$emit('update:module', { title: ($event.target as HTMLInputElement).value })"
    />
    <input
      :value="module.description ?? ''"
      placeholder="Описание модуля"
      @input="
        $emit('update:module', {
          description: ($event.target as HTMLInputElement).value || null
        })
      "
    />
    <button type="button" :disabled="mutating" @click="$emit('save')">Сохранить</button>
  </div>
</template>

<script setup lang="ts">
import type { StudioCourseModule } from "~/features/course-builder/model/types";

type ModulePatch = Partial<Pick<StudioCourseModule, "description" | "title">>;

defineEmits<{
  save: [];
  "update:module": [patch: ModulePatch];
}>();

defineProps<{
  module: StudioCourseModule;
  mutating: boolean;
}>();
</script>

<style scoped>
.module-edit {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 0.6rem;
  padding: 0.65rem;
}

.module-edit button {
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: var(--studio-button-bg);
  color: var(--studio-button-text);
  cursor: pointer;
  font: inherit;
  font-weight: 950;
  padding: 0 0.9rem;
}

input {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: var(--studio-control-bg);
  color: var(--studio-text);
  font: inherit;
  font-weight: 850;
  outline: none;
  padding: 0.78rem 0.9rem;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 760px) {
  .module-edit {
    grid-template-columns: 1fr;
  }
}
</style>
