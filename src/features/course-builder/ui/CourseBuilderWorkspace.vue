<template>
  <main class="studio-workspace">
    <section class="studio-hero">
      <div>
        <p class="eyebrow">Curs Studio</p>
        <h1>Course Builder Workspace</h1>
        <p>
          Создавайте курсы, модули и уроки в одном рабочем столе. Backend остается источником
          истины, Studio после каждого действия обновляет authoring read model.
        </p>
      </div>
      <div class="hero-status">
        <span :class="['pulse', { 'pulse--busy': mutating || loadingAuthoring }]" />
        <strong>{{ mutating ? "Сохраняем" : "Готово" }}</strong>
        <small v-if="lastSavedAt">Сохранено {{ formatTime(lastSavedAt) }}</small>
      </div>
    </section>

    <p v-if="error" class="problem">
      <strong>Ошибка</strong>
      <span>{{ error }}</span>
      <button type="button" @click="refreshCourses">Повторить</button>
    </p>

    <section class="builder-shell">
      <aside class="course-rail">
        <header class="panel-head">
          <div>
            <p class="eyebrow">Курсы</p>
            <h2>{{ total }}</h2>
          </div>
          <button
            class="icon-button"
            type="button"
            :disabled="loadingCourses"
            @click="refreshCourses"
          >
            ↻
          </button>
        </header>

        <form class="create-card" @submit.prevent="createCourse">
          <label>
            Новый курс
            <input v-model="createCourseForm.title" placeholder="Название курса" />
          </label>
          <textarea v-model="createCourseForm.description" placeholder="Короткое описание" />
          <div class="form-row">
            <select v-model="createCourseForm.level">
              <option value="beginner">Начальный</option>
              <option value="intermediate">Средний</option>
              <option value="advanced">Продвинутый</option>
            </select>
            <input v-model.number="createCourseForm.price" min="0" step="1" type="number" />
          </div>
          <button class="primary-action" type="submit" :disabled="mutating">Создать курс</button>
        </form>

        <div class="filters" role="group" aria-label="Фильтр курсов">
          <button
            v-for="item in filters"
            :key="item.value"
            type="button"
            :class="{ active: filter === item.value }"
            @click="filter = item.value"
          >
            {{ item.label }}
          </button>
        </div>

        <input v-model="search" class="search" placeholder="Поиск курса" />

        <div v-if="loadingCourses" class="skeleton-list" aria-label="Загрузка курсов">
          <span v-for="item in 4" :key="item" />
        </div>
        <div v-else-if="courses.length === 0" class="empty-state">
          <strong>Пока пусто</strong>
          <span>Создайте первый курс, чтобы открыть editor.</span>
        </div>
        <ul v-else class="course-list">
          <li v-for="course in courses" :key="course.course_id">
            <button
              type="button"
              :class="['course-item', { active: course.course_id === selectedCourseId }]"
              @click="selectCourse(course.course_id)"
            >
              <span class="state-chip">{{ stateLabel(course.publish_state) }}</span>
              <strong>{{ course.title }}</strong>
              <small>{{ course.modules_count }} мод. · {{ course.lessons_total }} ур.</small>
            </button>
          </li>
        </ul>
      </aside>

      <section class="editor-panel">
        <div v-if="loadingAuthoring && !authoring" class="editor-skeleton">
          <span />
          <span />
          <span />
        </div>
        <template v-else-if="selectedCourse && authoring">
          <header class="editor-header">
            <div>
              <p class="eyebrow">Редактор курса</p>
              <h2>{{ selectedCourse.title }}</h2>
            </div>
            <div class="editor-actions">
              <button class="ghost-action" type="button" @click="refreshAuthoring">Refetch</button>
              <button class="ghost-action" type="button">Предпросмотр</button>
            </div>
          </header>

          <section class="course-form">
            <label>
              Название
              <input v-model="courseForm.title" />
            </label>
            <label>
              Описание
              <textarea v-model="courseForm.description" />
            </label>
            <div class="form-row form-row--wide">
              <label>
                Уровень
                <select v-model="courseForm.level">
                  <option value="beginner">Начальный</option>
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </select>
              </label>
              <label>
                Цена USD
                <input v-model.number="courseForm.price" min="0" step="1" type="number" />
              </label>
              <button class="primary-action" type="button" :disabled="mutating" @click="saveCourse">
                Сохранить курс
              </button>
            </div>
          </section>

          <section class="structure-card">
            <header class="section-head">
              <div>
                <p class="eyebrow">Структура</p>
                <h3>Модули и уроки</h3>
              </div>
              <span>{{ modules.length }} модулей</span>
            </header>

            <form class="inline-create" @submit.prevent="addModule">
              <input v-model="moduleForm.title" placeholder="Название нового модуля" />
              <input v-model="moduleForm.description" placeholder="Описание модуля" />
              <button type="submit" :disabled="mutating">+ Модуль</button>
            </form>

            <div v-if="modules.length === 0" class="empty-module">
              <strong>Добавьте первый модуль</strong>
              <span>После этого можно будет создавать уроки внутри модуля.</span>
            </div>

            <article v-for="module in modules" :key="module.module_id" class="module-card">
              <header class="module-head">
                <button
                  type="button"
                  class="node-button"
                  @click="selectedNode = { type: 'module', moduleId: module.module_id }"
                >
                  <span>≡</span>
                  <strong>{{ module.position }}. {{ module.title }}</strong>
                </button>
                <span class="state-chip">{{ module.status }}</span>
              </header>

              <div class="module-edit">
                <input v-model="module.title" />
                <input v-model="module.description" placeholder="Описание модуля" />
                <button type="button" :disabled="mutating" @click="saveModule(module)">
                  Сохранить модуль
                </button>
              </div>

              <ul class="lesson-list">
                <li v-for="lesson in module.lessons" :key="lesson.lesson_id">
                  <button
                    type="button"
                    :class="[
                      'lesson-item',
                      {
                        active:
                          selectedNode.type === 'lesson' &&
                          selectedNode.lessonId === lesson.lesson_id
                      }
                    ]"
                    @click="
                      selectedNode = {
                        type: 'lesson',
                        moduleId: module.module_id,
                        lessonId: lesson.lesson_id
                      }
                    "
                  >
                    <span>{{ lesson.position }}</span>
                    <strong>{{ lesson.title }}</strong>
                    <small
                      >{{ lesson.content_type }} · {{ lesson.duration_minutes ?? "—" }} мин</small
                    >
                  </button>
                </li>
              </ul>

              <form
                class="inline-create lesson-create"
                @submit.prevent="addLesson(module.module_id)"
              >
                <input v-model="lessonForm.title" placeholder="Новый урок" />
                <input v-model.number="lessonForm.duration_minutes" min="1" type="number" />
                <button type="submit" :disabled="mutating">+ Урок</button>
              </form>
            </article>
          </section>
        </template>
        <div v-else class="empty-editor">
          <strong>Выберите курс</strong>
          <span>Или создайте новый курс слева, чтобы начать authoring.</span>
        </div>
      </section>

      <aside class="inspector-panel">
        <header class="panel-head">
          <div>
            <p class="eyebrow">Inspector</p>
            <h2>Готовность</h2>
          </div>
        </header>

        <template v-if="selectedCourse">
          <div class="publish-card">
            <span class="state-chip">{{ stateLabel(selectedCourse.publish_state) }}</span>
            <strong>{{ selectedCourse.title }}</strong>
            <small
              >v{{ selectedCourse.version }} · {{ formatDate(selectedCourse.updated_at) }}</small
            >
          </div>

          <ul class="checklist">
            <li v-for="item in readiness" :key="item.label" :class="{ done: item.done }">
              <span>{{ item.done ? "✓" : "!" }}</span>
              {{ item.label }}
            </li>
          </ul>

          <div v-if="selectedLesson" class="inspector-edit">
            <p class="eyebrow">Урок</p>
            <label>
              Название
              <input v-model="selectedLesson.title" />
            </label>
            <label>
              Описание
              <textarea v-model="selectedLesson.description" />
            </label>
            <div class="form-row">
              <select v-model="selectedLesson.content_type">
                <option value="video">Видео</option>
                <option value="text">Текст</option>
                <option value="quiz">Quiz</option>
                <option value="live">Live</option>
              </select>
              <input v-model.number="selectedLesson.duration_minutes" min="1" type="number" />
            </div>
            <label class="check-row">
              <input v-model="selectedLesson.is_preview" type="checkbox" />
              Preview урок
            </label>
            <button
              class="primary-action"
              type="button"
              :disabled="mutating || !selectedNodeIsLesson"
              @click="saveSelectedLesson"
            >
              Сохранить урок
            </button>
          </div>
          <div v-else class="inspector-hint">
            <strong>Выберите урок</strong>
            <span>Кликните по уроку в структуре, чтобы открыть быстрый редактор.</span>
          </div>

          <div class="publish-actions">
            <button
              class="primary-action"
              type="button"
              :disabled="mutating || !readyToPublish"
              @click="publishCourse"
            >
              Опубликовать
            </button>
            <button class="danger-action" type="button" :disabled="mutating" @click="archiveCourse">
              Архивировать
            </button>
          </div>
        </template>
        <div v-else class="inspector-hint">
          <strong>Нет курса</strong>
          <span>Создайте или выберите курс для проверки готовности.</span>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { CoursePublishState } from "~/shared/types/course-authoring";
import { useCourseBuilder } from "~/features/course-builder/model/use-course-builder";
import type { StudioCourseLesson } from "~/features/course-builder/model/types";

const filters: Array<{ label: string; value: "all" | "draft" | "published" | "archived" }> = [
  { label: "Все", value: "all" },
  { label: "Черновики", value: "draft" },
  { label: "Опубликовано", value: "published" },
  { label: "Архив", value: "archived" }
];

const {
  addLesson,
  addModule,
  archiveCourse,
  authoring,
  courseForm,
  courses,
  createCourse,
  createCourseForm,
  error,
  filter,
  lastSavedAt,
  lessonForm,
  loadingAuthoring,
  loadingCourses,
  moduleForm,
  modules,
  mutating,
  publishCourse,
  readiness,
  readyToPublish,
  refreshAuthoring,
  refreshCourses,
  saveCourse,
  saveLesson,
  saveModule,
  search,
  selectCourse,
  selectedCourse,
  selectedCourseId,
  selectedLesson,
  selectedNode,
  total
} = useCourseBuilder();

const selectedNodeIsLesson = computed(() => selectedNode.value.type === "lesson");

function stateLabel(state: CoursePublishState) {
  const labels: Record<string, string> = {
    archived: "Архив",
    draft: "Черновик",
    published: "Опубликован"
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

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function saveSelectedLesson() {
  if (selectedNode.value.type !== "lesson" || !selectedLesson.value) {
    return;
  }
  void saveLesson(selectedNode.value.moduleId, selectedLesson.value as StudioCourseLesson);
}
</script>

<style scoped>
.studio-workspace {
  width: min(1480px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.5rem 0 2.5rem;
}

.studio-hero,
.builder-shell,
.course-rail,
.editor-panel,
.inspector-panel,
.create-card,
.structure-card,
.module-card,
.publish-card,
.problem {
  border: 1px solid color-mix(in srgb, var(--c-border) 80%, transparent);
  box-shadow: 0 24px 90px rgb(15 23 42 / 0.08);
}

.studio-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1.25rem;
  border-radius: 28px;
  background:
    radial-gradient(circle at 18% 20%, rgb(56 189 248 / 0.18), transparent 30%),
    linear-gradient(135deg, var(--c-surface), color-mix(in srgb, var(--c-bg-soft) 80%, #fef3c7 20%));
}

.studio-hero h1,
.panel-head h2,
.editor-header h2,
.section-head h3 {
  margin: 0;
  letter-spacing: -0.04em;
}

.studio-hero h1 {
  font-size: clamp(2rem, 4vw, 4.4rem);
  line-height: 0.95;
}

.studio-hero p {
  max-width: 780px;
  margin: 0.75rem 0 0;
  color: var(--c-muted);
  font-weight: 700;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #0891b2;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-status {
  display: grid;
  min-width: 160px;
  gap: 0.2rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--c-border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--c-surface) 88%, transparent);
}

.hero-status small,
.course-item small,
.publish-card small,
.lesson-item small,
.inspector-hint span,
.empty-state span,
.empty-module span {
  color: var(--c-muted);
  font-weight: 700;
}

.pulse {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 6px rgb(34 197 94 / 0.14);
}

.pulse--busy {
  background: #f59e0b;
  box-shadow: 0 0 0 6px rgb(245 158 11 / 0.14);
}

.problem {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1rem;
  padding: 0.85rem 1rem;
  border-color: color-mix(in srgb, #ef4444 35%, var(--c-border));
  border-radius: 18px;
  background: color-mix(in srgb, var(--c-surface) 88%, #fee2e2 12%);
  color: var(--c-danger);
}

.problem button,
.icon-button,
.filters button,
.ghost-action,
.inline-create button,
.module-edit button,
.primary-action,
.danger-action {
  border: 0;
  cursor: pointer;
  font: inherit;
  font-weight: 900;
}

.problem button {
  margin-left: auto;
  border-radius: 999px;
  background: var(--c-danger);
  color: white;
  padding: 0.5rem 0.75rem;
}

.builder-shell {
  display: grid;
  grid-template-columns: minmax(280px, 340px) minmax(0, 1fr) minmax(290px, 340px);
  min-height: 720px;
  overflow: hidden;
  border-radius: 30px;
  background: linear-gradient(90deg, rgb(8 47 73 / 0.04), transparent 22%), var(--c-bg-soft);
}

.course-rail,
.editor-panel,
.inspector-panel {
  min-width: 0;
  padding: 1rem;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.course-rail,
.inspector-panel {
  background: color-mix(in srgb, var(--c-surface) 72%, transparent);
}

.editor-panel {
  border-right: 1px solid var(--c-border);
  border-left: 1px solid var(--c-border);
}

.panel-head,
.editor-header,
.section-head,
.module-head,
.form-row,
.editor-actions,
.publish-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-head,
.editor-header,
.section-head,
.module-head {
  justify-content: space-between;
}

.icon-button,
.ghost-action {
  border: 1px solid var(--c-border);
  border-radius: 999px;
  background: var(--c-surface);
  color: var(--c-text);
  padding: 0.55rem 0.75rem;
}

.create-card,
.course-form,
.structure-card,
.module-card,
.publish-card,
.inspector-edit,
.inspector-hint {
  margin-top: 1rem;
  border-radius: 22px;
  background: color-mix(in srgb, var(--c-surface) 90%, transparent);
}

.create-card,
.course-form,
.structure-card,
.module-card,
.inspector-edit,
.inspector-hint {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
}

label {
  display: grid;
  gap: 0.35rem;
  color: var(--c-muted);
  font-weight: 900;
}

input,
textarea,
select {
  width: 100%;
  border: 1px solid var(--c-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--c-surface) 96%, #fef3c7 4%);
  color: var(--c-text);
  font: inherit;
  font-weight: 750;
  outline: none;
  padding: 0.72rem 0.8rem;
  transition:
    border 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

textarea {
  min-height: 86px;
  resize: vertical;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #0891b2;
  box-shadow: 0 0 0 4px rgb(8 145 178 / 0.14);
}

.form-row {
  align-items: stretch;
}

.form-row > * {
  flex: 1;
}

.form-row--wide {
  align-items: end;
}

.primary-action,
.inline-create button {
  border-radius: 14px;
  background: linear-gradient(135deg, #0f766e, #0891b2);
  color: white;
  padding: 0.75rem 1rem;
}

.danger-action {
  border: 1px solid color-mix(in srgb, #ef4444 40%, var(--c-border));
  border-radius: 14px;
  background: color-mix(in srgb, var(--c-surface) 86%, #fee2e2 14%);
  color: var(--c-danger);
  padding: 0.75rem 1rem;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.filters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.45rem;
  margin-top: 1rem;
}

.filters button {
  border: 1px solid var(--c-border);
  border-radius: 999px;
  background: transparent;
  color: var(--c-muted);
  padding: 0.55rem 0.65rem;
}

.filters button.active {
  border-color: #0891b2;
  background: rgb(8 145 178 / 0.1);
  color: var(--c-text);
}

.search {
  margin-top: 0.75rem;
}

.course-list,
.lesson-list,
.checklist {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
}

.course-list {
  display: grid;
  gap: 0.6rem;
}

.course-item,
.lesson-item,
.node-button {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 18px;
  background: transparent;
  color: var(--c-text);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.course-item {
  display: grid;
  gap: 0.3rem;
  padding: 0.85rem;
}

.course-item:hover,
.course-item.active,
.lesson-item:hover,
.lesson-item.active {
  border-color: color-mix(in srgb, #0891b2 35%, var(--c-border));
  background: rgb(8 145 178 / 0.08);
}

.state-chip {
  width: fit-content;
  border: 1px solid var(--c-border);
  border-radius: 999px;
  color: var(--c-muted);
  font-size: 0.72rem;
  font-weight: 900;
  padding: 0.22rem 0.5rem;
}

.editor-skeleton,
.skeleton-list {
  display: grid;
  gap: 0.75rem;
}

.editor-skeleton span,
.skeleton-list span {
  height: 76px;
  border-radius: 18px;
  background: linear-gradient(90deg, var(--c-surface), var(--c-bg-soft), var(--c-surface));
  animation: shimmer 1.25s infinite linear;
}

@keyframes shimmer {
  0% {
    opacity: 0.55;
    transform: translateX(-2px);
  }
  50% {
    opacity: 1;
    transform: translateX(2px);
  }
  100% {
    opacity: 0.55;
    transform: translateX(-2px);
  }
}

.empty-state,
.empty-editor,
.empty-module {
  display: grid;
  place-items: start;
  gap: 0.35rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px dashed var(--c-border);
  border-radius: 20px;
  color: var(--c-muted);
}

.empty-editor {
  min-height: 420px;
  place-content: center;
  text-align: center;
}

.inline-create,
.module-edit {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) auto;
  gap: 0.55rem;
}

.module-card {
  border: 1px solid var(--c-border);
}

.node-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0;
}

.lesson-list {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.2rem;
}

.lesson-item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.75rem;
}

.lesson-item span {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: 9px;
  background: var(--c-bg-soft);
  color: var(--c-muted);
  font-weight: 900;
}

.lesson-create {
  grid-template-columns: minmax(0, 1fr) 92px auto;
}

.publish-card {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
}

.checklist {
  display: grid;
  gap: 0.45rem;
}

.checklist li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--c-muted);
  font-weight: 850;
}

.checklist span {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c-surface) 80%, #fde68a 20%);
  color: #92400e;
}

.checklist li.done span {
  background: rgb(34 197 94 / 0.16);
  color: #15803d;
}

.inspector-edit {
  border: 1px solid var(--c-border);
}

.check-row {
  display: flex;
  align-items: center;
  grid-template-columns: auto 1fr;
}

.check-row input {
  width: auto;
}

.publish-actions {
  align-items: stretch;
  margin-top: 1rem;
}

.publish-actions > * {
  flex: 1;
}

@media (max-width: 1180px) {
  .builder-shell {
    grid-template-columns: minmax(250px, 320px) minmax(0, 1fr);
  }

  .inspector-panel {
    grid-column: 1 / -1;
    border-top: 1px solid var(--c-border);
  }
}

@media (max-width: 820px) {
  .studio-workspace {
    width: min(100% - 1rem, 720px);
  }

  .studio-hero,
  .builder-shell {
    border-radius: 22px;
  }

  .studio-hero,
  .builder-shell,
  .form-row,
  .inline-create,
  .module-edit,
  .publish-actions {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .builder-shell {
    display: grid;
  }

  .editor-panel {
    border: 0;
    border-top: 1px solid var(--c-border);
  }

  .lesson-item {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .lesson-item small {
    grid-column: 2;
  }
}
</style>
