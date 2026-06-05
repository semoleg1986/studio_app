<template>
  <aside class="course-sidebar">
    <header class="sidebar-brand">
      <div>
        <strong>Curs Studio</strong>
        <span>Студия авторов</span>
      </div>
    </header>

    <section class="course-panel-head">
      <h1>Курсы</h1>
      <label class="search-box">
        <span>⌕</span>
        <input
          :value="search"
          placeholder="Поиск по курсам..."
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
          @keyup.enter="$emit('refresh')"
        />
        <button type="button" :disabled="loadingCourses" title="Обновить" @click="$emit('refresh')">
          ⌁
        </button>
      </label>

      <div class="filters" role="group" aria-label="Фильтр курсов">
        <button
          v-for="item in filters"
          :key="item.value"
          type="button"
          :class="{ active: filter === item.value }"
          @click="$emit('update:filter', item.value)"
        >
          {{ item.label }}
          <span v-if="item.value === 'all'">{{ total }}</span>
        </button>
      </div>

      <details class="create-course">
        <summary>
          <span>＋</span>
          Создать курс
        </summary>
        <form @submit.prevent="$emit('create')">
          <input
            :value="createCourseForm.title"
            placeholder="Название курса"
            @input="updateCreateCourseForm('title', ($event.target as HTMLInputElement).value)"
          />
          <textarea
            :value="createCourseForm.description"
            placeholder="Короткое описание"
            @input="
              updateCreateCourseForm('description', ($event.target as HTMLTextAreaElement).value)
            "
          />
          <div class="form-row">
            <select
              :value="createCourseForm.level"
              @change="updateCreateCourseForm('level', ($event.target as HTMLSelectElement).value)"
            >
              <option value="beginner">Начальный</option>
              <option value="intermediate">Средний</option>
              <option value="advanced">Продвинутый</option>
            </select>
            <input
              :value="createCourseForm.price"
              min="0"
              step="1"
              type="number"
              @input="
                updateCreateCourseForm(
                  'price',
                  Number(($event.target as HTMLInputElement).value) || 0
                )
              "
            />
          </div>
          <button class="primary-action" type="submit" :disabled="mutating">Создать</button>
        </form>
      </details>
    </section>

    <div v-if="loadingCourses" class="skeleton-list" aria-label="Загрузка курсов">
      <span v-for="item in 4" :key="item" />
    </div>
    <div v-else-if="courses.length === 0" class="empty-sidebar">
      <strong>Пока пусто</strong>
      <span>Создайте первый курс.</span>
    </div>
    <ul v-else class="course-list">
      <li v-for="course in courses" :key="course.course_id">
        <button
          type="button"
          :class="['course-item', { active: course.course_id === selectedCourseId }]"
          @click="$emit('select', course.course_id)"
        >
          <span class="course-item__menu">⋮</span>
          <strong>{{ course.title }}</strong>
          <span class="state-chip" :data-state="course.publish_state">
            {{ stateLabel(course.publish_state) }}
          </span>
          <small>Модулей: {{ course.modules_count }} · Уроков: {{ course.lessons_total }}</small>
          <small>Обновлен {{ formatDate(course.updated_at) }}</small>
        </button>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import type { StudioCourse } from "~/features/course-builder/model/types";
import type { CoursePublishState } from "~/shared/types/course-authoring";

type CourseFilter = "all" | "draft" | "published" | "archived";

type CreateCourseForm = {
  description: string;
  level: string;
  price: number;
  title: string;
};

const filters: Array<{ label: string; value: CourseFilter }> = [
  { label: "Все", value: "all" },
  { label: "Черновики", value: "draft" },
  { label: "Опубликовано", value: "published" },
  { label: "Архив", value: "archived" }
];

const emit = defineEmits<{
  create: [];
  refresh: [];
  select: [courseId: string];
  "update:createCourseForm": [patch: Partial<CreateCourseForm>];
  "update:filter": [filter: CourseFilter];
  "update:search": [search: string];
}>();

defineProps<{
  courses: StudioCourse[];
  createCourseForm: CreateCourseForm;
  filter: CourseFilter;
  loadingCourses: boolean;
  mutating: boolean;
  search: string;
  selectedCourseId: string | null;
  total: number;
}>();

function stateLabel(state: CoursePublishState) {
  const labels: Record<string, string> = {
    archived: "Архив",
    draft: "Черновик",
    published: "Опубликовано"
  };
  return labels[state] ?? state;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function updateCreateCourseForm<K extends keyof CreateCourseForm>(
  key: K,
  value: CreateCourseForm[K]
) {
  emit("update:createCourseForm", { [key]: value });
}
</script>

<style scoped>
.course-sidebar {
  display: grid;
  min-height: 0;
  grid-template-rows: auto auto minmax(0, 1fr);
  border-right: 1px solid var(--studio-line);
  background:
    radial-gradient(circle at 0 0, rgb(137 220 230 / 0.12), transparent 36%),
    color-mix(in srgb, var(--studio-panel) 84%, transparent);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-height: 78px;
  padding: 0.95rem 1.15rem;
}

.sidebar-brand strong,
.sidebar-brand span {
  display: block;
}

.sidebar-brand strong {
  color: var(--studio-text);
  font-size: 1.15rem;
  font-weight: 950;
  letter-spacing: -0.03em;
}

.sidebar-brand span,
.course-item small,
.empty-sidebar span {
  color: var(--studio-muted);
}

.course-panel-head {
  display: grid;
  gap: 0.82rem;
  padding: 0.9rem 1rem 1rem;
}

.course-panel-head h1 {
  margin: 0;
  color: var(--studio-text);
  font-size: 1.25rem;
  font-weight: 950;
  letter-spacing: -0.035em;
}

.search-box {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 34px;
  align-items: center;
  gap: 0.45rem;
  height: 40px;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: rgb(0 0 0 / 0.12);
  padding: 0 0.48rem 0 0.72rem;
}

.search-box span {
  color: var(--studio-dim);
}

.search-box input,
.search-box button {
  border: 0;
  background: transparent;
}

.search-box button {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--studio-line);
  border-radius: 8px;
  color: var(--studio-muted);
  cursor: pointer;
}

.filters,
.form-row {
  display: flex;
  align-items: center;
}

.filters {
  flex-wrap: wrap;
  gap: 0.44rem;
}

.filters button,
.state-chip {
  border: 1px solid var(--studio-line);
  border-radius: 999px;
  background: rgb(0 0 0 / 0.12);
  color: var(--studio-muted);
  font-size: 0.78rem;
  font-weight: 950;
  padding: 0.32rem 0.64rem;
}

.filters button.active {
  border-color: rgb(137 220 230 / 0.46);
  background: rgb(137 220 230 / 0.14);
  color: var(--studio-accent);
}

.filters span {
  margin-left: 0.32rem;
  color: var(--studio-soft);
}

.state-chip[data-state="published"] {
  color: var(--studio-success);
}

.state-chip[data-state="archived"] {
  color: var(--studio-dim);
}

.create-course summary {
  display: grid;
  height: 48px;
  grid-template-columns: auto auto;
  place-content: center;
  gap: 0.6rem;
  border-radius: 11px;
  background: linear-gradient(135deg, #85dce7, #5599a4);
  color: #0a171c;
  cursor: pointer;
  font-weight: 1000;
  list-style: none;
}

.create-course summary::-webkit-details-marker {
  display: none;
}

.create-course form {
  display: grid;
  gap: 0.56rem;
  margin-top: 0.7rem;
  padding: 0.7rem;
  border: 1px solid var(--studio-line);
  border-radius: 12px;
  background: rgb(255 255 255 / 0.035);
}

.course-list {
  display: grid;
  align-content: start;
  gap: 0.72rem;
  overflow: auto;
  margin: 0;
  padding: 0 1rem 1rem;
  list-style: none;
}

.course-item {
  position: relative;
  display: grid;
  width: 100%;
  gap: 0.42rem;
  border: 1px solid var(--studio-line);
  border-radius: 12px;
  background: rgb(255 255 255 / 0.035);
  color: var(--studio-text);
  cursor: pointer;
  font: inherit;
  padding: 0.88rem;
  text-align: left;
  transition: all 160ms ease;
}

.course-item:hover,
.course-item.active {
  border-color: rgb(137 220 230 / 0.45);
  background: rgb(137 220 230 / 0.1);
}

.course-item__menu {
  position: absolute;
  top: 0.72rem;
  right: 0.62rem;
  color: var(--studio-muted);
}

.course-item strong {
  max-width: 220px;
  color: var(--studio-text);
  font-weight: 950;
  line-height: 1.22;
}

.empty-sidebar,
.skeleton-list {
  display: grid;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
  color: var(--studio-muted);
}

.editor-skeleton,
.skeleton-list {
  gap: 0.75rem;
}

.skeleton-list span {
  display: block;
  height: 72px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    rgb(255 255 255 / 0.035),
    rgb(137 220 230 / 0.08),
    rgb(255 255 255 / 0.035)
  );
}

.form-row {
  gap: 0.56rem;
}

.form-row > * {
  min-width: 0;
  flex: 1;
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

textarea {
  min-height: 84px;
  resize: vertical;
}

.primary-action {
  min-height: 42px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--studio-accent), var(--studio-accent-2));
  color: #082024;
  font-weight: 950;
  padding: 0 1rem;
}

.primary-action:disabled,
.search-box button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 1180px) {
  .course-sidebar {
    min-height: 360px;
    border-right: 0;
    border-bottom: 1px solid var(--studio-line);
  }
}
</style>
