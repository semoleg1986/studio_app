<template>
  <section class="course-card surface-card">
    <div class="course-card__grid">
      <label class="field field--title">
        <span>Название курса</span>
        <div class="input-shell input-shell--with-icon">
          <input
            :value="courseForm.title"
            @blur="$emit('save')"
            @input="updateCourseForm('title', ($event.target as HTMLInputElement).value)"
          />
          <i>✎</i>
        </div>
      </label>
      <label class="field field--level">
        <span>Уровень</span>
        <div class="input-shell input-shell--select">
          <b>▥</b>
          <select
            :value="courseForm.level"
            @change="
              updateCourseForm('level', ($event.target as HTMLSelectElement).value);
              $emit('save');
            "
          >
            <option value="beginner">Начальный</option>
            <option value="intermediate">Средний</option>
            <option value="advanced">Продвинутый</option>
          </select>
        </div>
      </label>
      <label class="field field--description">
        <span>Описание</span>
        <div class="rich-editor">
          <div class="rich-toolbar" aria-hidden="true">
            <b>B</b>
            <i>I</i>
            <span>↗</span>
            <span>≡</span>
            <span>☷</span>
          </div>
          <textarea
            :value="courseForm.description"
            maxlength="300"
            @blur="$emit('save')"
            @input="updateCourseForm('description', ($event.target as HTMLTextAreaElement).value)"
          />
          <small>{{ courseForm.description.length }}/300</small>
        </div>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
type CourseForm = {
  description: string;
  level: string;
  price: number;
  title: string;
};

const emit = defineEmits<{
  save: [];
  "update:courseForm": [patch: Partial<CourseForm>];
}>();

defineProps<{
  courseForm: CourseForm;
}>();

function updateCourseForm<K extends keyof CourseForm>(key: K, value: CourseForm[K]) {
  emit("update:courseForm", { [key]: value });
}
</script>

<style scoped>
.surface-card {
  border: 1px solid var(--studio-line);
  border-radius: 18px;
  background: linear-gradient(
    145deg,
    var(--studio-panel),
    color-mix(in srgb, var(--studio-panel) 72%, transparent)
  );
  box-shadow: var(--studio-shadow);
}

.course-card {
  padding: 1.1rem;
}

.course-card__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.46rem;
}

.field span,
.field small {
  color: var(--studio-muted);
}

.field--description {
  grid-column: 1 / -1;
}

.input-shell,
.rich-editor {
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

.input-shell i,
.input-shell b {
  color: var(--studio-accent);
  font-style: normal;
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
.input-shell select {
  border: 0;
  background: transparent;
}

textarea {
  min-height: 84px;
  resize: vertical;
}

.rich-editor {
  overflow: hidden;
}

.rich-toolbar {
  display: flex;
  gap: 0.7rem;
  padding: 0.72rem 0.9rem;
  border-bottom: 1px solid var(--studio-line);
  color: var(--studio-soft);
}

.rich-editor textarea {
  min-height: 120px;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.rich-editor small {
  display: block;
  padding: 0 0.85rem 0.75rem;
  text-align: right;
}

@media (max-width: 760px) {
  .course-card__grid {
    grid-template-columns: 1fr;
  }
}
</style>
