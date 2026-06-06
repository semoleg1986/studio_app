<template>
  <form class="inline-create lesson-create" @submit.prevent="$emit('add-lesson')">
    <input
      :value="lessonForm.title"
      placeholder="Новый урок"
      @input="updateLessonForm('title', ($event.target as HTMLInputElement).value)"
    />
    <input
      :value="lessonForm.duration_minutes"
      min="1"
      type="number"
      @input="
        updateLessonForm(
          'duration_minutes',
          Number(($event.target as HTMLInputElement).value) || 15
        )
      "
    />
    <button type="submit" :disabled="mutating">+ Урок</button>
  </form>
</template>

<script setup lang="ts">
type LessonForm = {
  content_type: string;
  description: string;
  duration_minutes: number;
  is_preview: boolean;
  title: string;
};

const emit = defineEmits<{
  "add-lesson": [];
  "update:lessonForm": [patch: Partial<LessonForm>];
}>();

defineProps<{
  lessonForm: LessonForm;
  mutating: boolean;
}>();

function updateLessonForm<K extends keyof LessonForm>(key: K, value: LessonForm[K]) {
  emit("update:lessonForm", { [key]: value });
}
</script>

<style scoped>
.inline-create {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.6rem;
}

.lesson-create {
  grid-template-columns: minmax(0, 1fr) 88px auto;
  padding: 0 0.65rem 0.65rem;
}

.lesson-create button {
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
  .lesson-create {
    grid-template-columns: 1fr;
  }
}
</style>
