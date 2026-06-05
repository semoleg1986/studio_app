<template>
  <main :class="['studio-shell', `studio-shell--${resolvedTheme}`]">
    <aside class="icon-rail" aria-label="Studio navigation">
      <NuxtLink class="rail-logo" to="/" aria-label="Curs Studio">C</NuxtLink>
      <nav class="rail-nav" aria-label="Studio sections">
        <button class="rail-action" type="button" title="Обзор">▦</button>
        <button class="rail-action rail-action--active" type="button" title="Курсы">▤</button>
        <button class="rail-action" type="button" title="Пользователи">◎</button>
        <button class="rail-action" type="button" title="Аналитика">▧</button>
        <button class="rail-action" type="button" title="Теги">◇</button>
      </nav>
      <div class="rail-bottom">
        <button
          :class="['rail-action', { 'rail-action--open': settingsOpen }]"
          type="button"
          title="Настройки"
          @click="settingsOpen = !settingsOpen"
        >
          ⚙
        </button>
        <div v-if="settingsOpen" class="settings-popover" role="dialog" aria-label="Настройки">
          <strong>Тема</strong>
          <div class="theme-switcher" role="group" aria-label="Тема Studio">
            <button
              type="button"
              :class="{ active: themeMode === 'system' }"
              @click="setStudioTheme('system')"
            >
              Системная
            </button>
            <button
              type="button"
              :class="{ active: themeMode === 'light' }"
              @click="setStudioTheme('light')"
            >
              Светлая
            </button>
            <button
              type="button"
              :class="{ active: themeMode === 'dark' }"
              @click="setStudioTheme('dark')"
            >
              Темная
            </button>
          </div>
        </div>
        <span class="rail-user">{{ userInitial }}</span>
      </div>
    </aside>

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
          <input v-model="search" placeholder="Поиск по курсам..." @keyup.enter="refreshCourses" />
          <button type="button" :disabled="loadingCourses" title="Обновить" @click="refreshCourses">
            ⌁
          </button>
        </label>

        <div class="filters" role="group" aria-label="Фильтр курсов">
          <button
            v-for="item in filters"
            :key="item.value"
            type="button"
            :class="{ active: filter === item.value }"
            @click="filter = item.value"
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
          <form @submit.prevent="createCourse">
            <input v-model="createCourseForm.title" placeholder="Название курса" />
            <textarea v-model="createCourseForm.description" placeholder="Короткое описание" />
            <div class="form-row">
              <select v-model="createCourseForm.level">
                <option value="beginner">Начальный</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
              <input v-model.number="createCourseForm.price" min="0" step="1" type="number" />
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
            @click="selectCourse(course.course_id)"
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

    <section class="workspace-main">
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
          <span v-if="lastSavedAt" class="save-state"
            >✓ Сохранено {{ formatTime(lastSavedAt) }}</span
          >
          <span v-else class="save-state">{{ mutating ? "Сохраняем..." : "Сохранено" }}</span>
          <button class="activity-button" type="button" title="Состояние">⌁</button>
          <div class="history-buttons" aria-hidden="true">
            <button type="button" disabled>↶</button>
            <button type="button" disabled>↷</button>
          </div>
          <button class="ghost-action" type="button" :disabled="!selectedCourse">
            Предпросмотр
          </button>
          <button
            class="primary-action toolbar-publish"
            type="button"
            :disabled="mutating || !readyToPublish"
            @click="publishCourse"
          >
            Опубликовать
          </button>
          <button class="menu-button" type="button">⋮</button>
        </div>
      </header>

      <p v-if="error" class="problem">
        <strong>Ошибка</strong>
        <span>{{ error }}</span>
        <button type="button" @click="refreshCourses">Повторить</button>
      </p>

      <div class="builder-grid">
        <section class="editor-panel">
          <div v-if="loadingAuthoring && !authoring" class="editor-skeleton">
            <span />
            <span />
            <span />
          </div>

          <template v-else-if="selectedCourse && authoring">
            <section class="course-card surface-card">
              <div class="course-card__grid">
                <label class="field field--title">
                  <span>Название курса</span>
                  <div class="input-shell input-shell--with-icon">
                    <input v-model="courseForm.title" @blur="saveCourse" />
                    <i>✎</i>
                  </div>
                </label>
                <label class="field field--level">
                  <span>Уровень</span>
                  <div class="input-shell input-shell--select">
                    <b>▥</b>
                    <select v-model="courseForm.level" @change="saveCourse">
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
                    <textarea v-model="courseForm.description" maxlength="300" @blur="saveCourse" />
                    <small>{{ courseForm.description.length }}/300</small>
                  </div>
                </label>
              </div>
            </section>

            <section class="structure-card surface-card">
              <header class="tabs-row">
                <div class="tabs">
                  <button class="tab tab--active" type="button">Модули</button>
                  <button class="tab" type="button">
                    Уроки <span>{{ lessonCount }}</span>
                  </button>
                </div>
                <button
                  class="ghost-action ghost-action--small"
                  type="button"
                  @click="refreshAuthoring"
                >
                  Обновить
                </button>
              </header>

              <div :class="['authoring-lane', { 'authoring-lane--with-lesson': selectedLesson }]">
                <div class="modules-column">
                  <form class="inline-create" @submit.prevent="addModule">
                    <input v-model="moduleForm.title" placeholder="Название нового модуля" />
                    <button type="submit" :disabled="mutating">+ Модуль</button>
                  </form>

                  <div v-if="modules.length === 0" class="empty-editor">
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
                        <span class="drag-handle">⠿</span>
                        <strong>{{ module.position }}. {{ module.title }}</strong>
                        <small>{{ module.lessons.length }} урока</small>
                        <span class="collapse-mark">⌃</span>
                      </button>
                      <div class="node-actions">
                        <button
                          type="button"
                          :disabled="mutating"
                          @click="moveModule(module.module_id, -1)"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          :disabled="mutating"
                          @click="moveModule(module.module_id, 1)"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          :disabled="mutating"
                          @click="duplicateModule(module.module_id)"
                        >
                          ⧉
                        </button>
                        <button
                          class="danger-link"
                          type="button"
                          :disabled="mutating || module.status === 'archived'"
                          @click="archiveModule(module.module_id)"
                        >
                          ×
                        </button>
                      </div>
                    </header>

                    <div class="module-edit">
                      <input v-model="module.title" />
                      <input v-model="module.description" placeholder="Описание модуля" />
                      <button type="button" :disabled="mutating" @click="saveModule(module)">
                        Сохранить
                      </button>
                    </div>

                    <ul class="lesson-list">
                      <li v-for="lesson in module.lessons" :key="lesson.lesson_id">
                        <div
                          :class="[
                            'lesson-row',
                            {
                              active:
                                selectedNode.type === 'lesson' &&
                                selectedNode.lessonId === lesson.lesson_id
                            }
                          ]"
                        >
                          <button
                            type="button"
                            class="lesson-item"
                            @click="
                              selectedNode = {
                                type: 'lesson',
                                moduleId: module.module_id,
                                lessonId: lesson.lesson_id
                              }
                            "
                          >
                            <span class="lesson-position"
                              >{{ module.position }}.{{ lesson.position }}</span
                            >
                            <strong>{{ lesson.title }}</strong>
                            <small class="lesson-type">{{
                              contentTypeLabel(lesson.content_type)
                            }}</small>
                            <small>{{ lesson.duration_minutes ?? "—" }} мин</small>
                            <span class="lesson-status">✓</span>
                          </button>
                          <div class="lesson-actions">
                            <button
                              type="button"
                              :disabled="mutating"
                              @click="moveLesson(module.module_id, lesson.lesson_id, -1)"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              :disabled="mutating"
                              @click="moveLesson(module.module_id, lesson.lesson_id, 1)"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              :disabled="mutating"
                              @click="duplicateLesson(module.module_id, lesson.lesson_id)"
                            >
                              ⧉
                            </button>
                            <button
                              class="danger-link"
                              type="button"
                              :disabled="mutating || lesson.status === 'archived'"
                              @click="archiveLesson(module.module_id, lesson.lesson_id)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
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
                </div>

                <aside v-if="selectedLesson" class="lesson-drawer">
                  <h2>Урок</h2>
                  <label class="field">
                    <span>Название урока</span>
                    <input v-model="selectedLesson.title" />
                  </label>
                  <label class="field">
                    <span>Тип урока</span>
                    <div class="input-shell input-shell--select">
                      <b>▧</b>
                      <select v-model="selectedLesson.content_type">
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
                        v-model.number="selectedLesson.duration_minutes"
                        min="1"
                        type="number"
                      />
                      <span>мин</span>
                    </div>
                  </label>
                  <label class="field">
                    <span>Описание</span>
                    <textarea v-model="selectedLesson.description" />
                  </label>
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
                </aside>
              </div>
            </section>
          </template>

          <div v-else class="empty-editor empty-editor--large">
            <strong>Выберите курс</strong>
            <span>Или создайте новый курс слева, чтобы начать authoring.</span>
          </div>
        </section>

        <aside class="inspector-panel">
          <template v-if="selectedCourse && authoring">
            <section class="inspector-card readiness-card">
              <h2>Готовность</h2>
              <div class="readiness-body">
                <div class="readiness-ring" :style="{ '--progress': `${readinessPercent}%` }">
                  <span>{{ readinessPercent }}%</span>
                </div>
                <p>
                  {{ readyToPublish ? "Курс готов к публикации" : "Курс почти готов к публикации" }}
                </p>
              </div>
              <ul class="checklist">
                <li v-for="item in readiness" :key="item.label" :class="{ done: item.done }">
                  <span>{{ item.done ? "✓" : "!" }}</span>
                  <div>
                    <strong>{{ item.label }}</strong>
                    <small v-if="item.detail">{{ item.detail }}</small>
                  </div>
                </li>
              </ul>
            </section>

            <section class="inspector-card status-card">
              <h2>Статус</h2>
              <span class="state-chip" :data-state="selectedCourse.publish_state">
                {{ stateLabel(selectedCourse.publish_state) }}
              </span>
              <p>
                draft v{{ draftVersion }} · published {{ publishedVersion }} ·
                {{ hasUnpublishedChanges ? "есть изменения" : "без изменений" }}
              </p>
              <button
                class="primary-action"
                type="button"
                :disabled="mutating || !readyToPublish"
                @click="publishCourse"
              >
                Опубликовать
              </button>
              <button class="ghost-action" type="button" disabled>Предпросмотр</button>
              <button
                class="danger-action"
                type="button"
                :disabled="mutating"
                @click="archiveCourse"
              >
                Архивировать
              </button>
              <small>ID курса: {{ selectedCourse.course_id }}</small>
            </section>
          </template>

          <section v-else class="inspector-card inspector-hint">
            <strong>Нет курса</strong>
            <span>Создайте или выберите курс для проверки готовности.</span>
          </section>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { CoursePublishState } from "~/shared/types/course-authoring";
import { useAuthSession } from "~/features/auth";
import { useCourseBuilder } from "~/features/course-builder/model/use-course-builder";
import type { StudioCourseLesson } from "~/features/course-builder/model/types";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";
import type { ThemeMode } from "~/shared/lib/preferences/types";

const filters: Array<{ label: string; value: "all" | "draft" | "published" | "archived" }> = [
  { label: "Все", value: "all" },
  { label: "Черновики", value: "draft" },
  { label: "Опубликовано", value: "published" },
  { label: "Архив", value: "archived" }
];

const { user } = useAuthSession();
const { resolvedTheme, setThemeMode, themeMode } = usePreferences();
const settingsOpen = ref(false);
const {
  addLesson,
  addModule,
  archiveCourse,
  archiveLesson,
  archiveModule,
  authoring,
  courseForm,
  courses,
  createCourse,
  createCourseForm,
  error,
  filter,
  hasUnpublishedChanges,
  lastSavedAt,
  lessonForm,
  loadingAuthoring,
  loadingCourses,
  moduleForm,
  modules,
  moveLesson,
  moveModule,
  mutating,
  publishCourse,
  readiness,
  readyToPublish,
  refreshAuthoring,
  refreshCourses,
  saveCourse,
  saveLesson,
  saveModule,
  duplicateLesson,
  duplicateModule,
  search,
  selectCourse,
  selectedCourse,
  selectedCourseId,
  selectedLesson,
  selectedNode,
  total
} = useCourseBuilder();

const selectedNodeIsLesson = computed(() => selectedNode.value.type === "lesson");
const lessonCount = computed(() =>
  modules.value.reduce((count, module) => count + module.lessons.length, 0)
);
const readinessPercent = computed(() => {
  if (readiness.value.length === 0) {
    return 0;
  }
  const done = readiness.value.filter((item) => item.done).length;
  return Math.round((done / readiness.value.length) * 100);
});
const draftVersion = computed(() => authoring.value?.draft_version ?? "—");
const publishedVersion = computed(() => authoring.value?.published_version ?? "—");
const userInitial = computed(() => user.value?.email?.slice(0, 1).toUpperCase() ?? "C");

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

function setStudioTheme(nextThemeMode: ThemeMode) {
  setThemeMode(nextThemeMode);
  settingsOpen.value = false;
}
</script>

<style scoped>
.studio-shell {
  --studio-bg: #071115;
  --studio-bg-2: #0d171c;
  --studio-panel: #111c21;
  --studio-panel-2: #17252b;
  --studio-panel-3: #213139;
  --studio-line: rgb(159 199 207 / 0.18);
  --studio-line-strong: rgb(159 199 207 / 0.3);
  --studio-text: #edf6f8;
  --studio-soft: #c9d7db;
  --studio-muted: #8d9fa6;
  --studio-dim: #5e737b;
  --studio-accent: #89dce6;
  --studio-accent-2: #62aeb9;
  --studio-success: #7bd99b;
  --studio-warning: #e4b966;
  --studio-danger: #ed8a7d;
  --studio-radius: 16px;
  --studio-shadow: 0 26px 90px rgb(0 0 0 / 0.42);

  display: grid;
  grid-template-columns: 78px 292px minmax(0, 1fr);
  height: 100dvh;
  overflow: hidden;
  border: 1px solid var(--studio-line-strong);
  background:
    radial-gradient(circle at 72% 0%, rgb(137 220 230 / 0.12), transparent 34%),
    linear-gradient(135deg, var(--studio-bg), var(--studio-bg-2));
  color: var(--studio-text);
  font-family: "Nunito Sans", "Avenir Next", "Trebuchet MS", sans-serif;
  font-size: 14px;
  line-height: 1.38;
}

:global([data-theme="light"]) .studio-shell,
.studio-shell--light {
  --studio-bg: #eef4f5;
  --studio-bg-2: #f8fbfa;
  --studio-panel: #ffffff;
  --studio-panel-2: #edf5f6;
  --studio-panel-3: #dcebed;
  --studio-line: rgb(34 70 78 / 0.14);
  --studio-line-strong: rgb(34 70 78 / 0.24);
  --studio-text: #152126;
  --studio-soft: #27363b;
  --studio-muted: #607178;
  --studio-dim: #84959a;
  --studio-accent: #217f8e;
  --studio-accent-2: #62aeb9;
  --studio-success: #238956;
  --studio-warning: #9a6b18;
  --studio-danger: #b74a3f;
  --studio-shadow: 0 26px 90px rgb(24 50 58 / 0.13);
}

.icon-rail,
.course-sidebar,
.workspace-main,
.editor-panel,
.inspector-panel {
  min-height: 0;
}

.icon-rail {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  padding: 1.05rem 0.85rem;
  border-right: 1px solid var(--studio-line);
  background: color-mix(in srgb, var(--studio-bg) 92%, transparent);
}

.rail-logo,
.rail-user,
.rail-action {
  display: grid;
  place-items: center;
}

.rail-logo {
  border: 1px solid rgb(137 220 230 / 0.35);
  border-radius: 14px;
  background: linear-gradient(135deg, #9ce7ee, #c7a16f);
  color: #0a171c;
  font-weight: 1000;
  text-decoration: none;
}

.rail-logo {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  font-size: 1.05rem;
}

.rail-nav,
.rail-bottom {
  display: grid;
  justify-items: center;
  gap: 0.72rem;
}

.rail-nav {
  align-content: start;
  padding-top: 2.6rem;
}

.rail-bottom {
  align-content: end;
  position: relative;
}

.rail-action {
  position: relative;
  width: 42px;
  height: 42px;
  border: 1px solid transparent;
  border-radius: 13px;
  background: transparent;
  color: var(--studio-muted);
  cursor: pointer;
  font: inherit;
  font-size: 1.15rem;
  text-decoration: none;
  transition: all 160ms ease;
}

.rail-action:hover,
.rail-action--active,
.rail-action--open {
  border-color: var(--studio-line);
  background: rgb(137 220 230 / 0.11);
  color: var(--studio-accent);
}

.settings-popover {
  position: absolute;
  bottom: 46px;
  left: calc(100% + 0.9rem);
  z-index: 40;
  display: grid;
  width: 230px;
  gap: 0.7rem;
  padding: 0.8rem;
  border: 1px solid var(--studio-line-strong);
  border-radius: 14px;
  background: color-mix(in srgb, var(--studio-panel) 96%, transparent);
  box-shadow: var(--studio-shadow);
}

.settings-popover strong {
  color: var(--studio-text);
  font-weight: 950;
}

.theme-switcher {
  display: grid;
  gap: 0.42rem;
}

.theme-switcher button {
  width: 100%;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: rgb(0 0 0 / 0.12);
  color: var(--studio-muted);
  cursor: pointer;
  font: inherit;
  font-weight: 900;
  padding: 0.58rem 0.72rem;
  text-align: left;
}

.studio-shell--light .theme-switcher button {
  background: rgb(255 255 255 / 0.72);
}

.theme-switcher button.active {
  border-color: rgb(137 220 230 / 0.5);
  background: rgb(137 220 230 / 0.14);
  color: var(--studio-accent);
}

.rail-action--active::before {
  position: absolute;
  left: -14px;
  width: 3px;
  height: 30px;
  border-radius: 999px;
  background: var(--studio-accent);
  content: "";
}

.rail-user {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  background: var(--studio-panel-3);
  color: var(--studio-accent);
  font-weight: 1000;
}

.course-sidebar {
  display: grid;
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
.save-state,
.field span,
.field small,
.course-item small,
.empty-sidebar span,
.status-card p,
.status-card small,
.checklist small,
.readiness-body p,
.lesson-drawer p,
.node-button small {
  color: var(--studio-muted);
}

.course-panel-head {
  display: grid;
  gap: 0.82rem;
  padding: 0.9rem 1rem 1rem;
}

.course-panel-head h1,
.inspector-card h2,
.lesson-drawer h2 {
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

:global([data-theme="light"]) .search-box,
.studio-shell--light .search-box {
  background: rgb(255 255 255 / 0.72);
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

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.44rem;
}

.filters button,
.state-chip,
.tab,
.ghost-action,
.history-buttons button,
.menu-button,
.activity-button,
.node-actions button,
.lesson-actions button {
  border: 1px solid var(--studio-line);
  background: rgb(0 0 0 / 0.12);
  color: var(--studio-muted);
}

:global([data-theme="light"]) .filters button,
:global([data-theme="light"]) .state-chip,
:global([data-theme="light"]) .tab,
:global([data-theme="light"]) .ghost-action,
:global([data-theme="light"]) .history-buttons button,
:global([data-theme="light"]) .menu-button,
:global([data-theme="light"]) .activity-button,
:global([data-theme="light"]) .node-actions button,
:global([data-theme="light"]) .lesson-actions button,
.studio-shell--light .filters button,
.studio-shell--light .state-chip,
.studio-shell--light .tab,
.studio-shell--light .ghost-action,
.studio-shell--light .history-buttons button,
.studio-shell--light .menu-button,
.studio-shell--light .activity-button,
.studio-shell--light .node-actions button,
.studio-shell--light .lesson-actions button {
  background: rgb(255 255 255 / 0.72);
}

.filters button,
.state-chip,
.tab {
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 950;
  padding: 0.32rem 0.64rem;
}

.filters button.active,
.tab--active {
  border-color: rgb(137 220 230 / 0.46);
  background: rgb(137 220 230 / 0.14);
  color: var(--studio-accent);
}

.filters span {
  margin-left: 0.32rem;
  color: var(--studio-soft);
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
  padding: 0 1rem 1rem;
}

.course-list,
.lesson-list,
.checklist {
  list-style: none;
  margin: 0;
  padding-left: 0;
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

.workspace-main {
  display: grid;
  min-width: 0;
  grid-template-rows: 78px auto minmax(0, 1fr);
}

.workspace-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, auto);
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.05rem;
  border-bottom: 1px solid var(--studio-line);
  background: color-mix(in srgb, var(--studio-bg) 74%, transparent);
}

.breadcrumbs,
.toolbar-actions,
.form-row,
.tabs-row,
.module-head,
.lesson-row,
.node-actions,
.lesson-actions,
.readiness-body {
  display: flex;
  align-items: center;
}

.breadcrumbs,
.toolbar-actions {
  min-width: 0;
  gap: 0.72rem;
}

.breadcrumbs {
  color: var(--studio-muted);
  font-weight: 900;
}

.breadcrumbs strong {
  overflow: hidden;
  color: var(--studio-text);
  font-size: 1.05rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-actions {
  flex-shrink: 0;
  max-width: 100%;
  overflow: hidden;
}

.history-buttons {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--studio-line);
  border-radius: 11px;
}

.history-buttons button {
  width: 38px;
  height: 38px;
  border: 0;
  border-right: 1px solid var(--studio-line);
}

.history-buttons button:last-child {
  border-right: 0;
}

.activity-button,
.menu-button,
.ghost-action,
.primary-action,
.danger-action,
.inline-create button,
.module-edit button,
.search-box button,
.node-actions button,
.lesson-actions button,
.history-buttons button {
  cursor: pointer;
  font: inherit;
  font-weight: 950;
  transition: all 160ms ease;
}

.activity-button,
.menu-button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 11px;
}

.ghost-action,
.primary-action,
.danger-action {
  min-height: 42px;
  border-radius: 11px;
  padding: 0 1rem;
}

.ghost-action {
  color: var(--studio-accent);
}

.ghost-action--small {
  min-height: 34px;
  padding-inline: 0.72rem;
}

.primary-action {
  border: 0;
  background: linear-gradient(135deg, #89dce6, #5aa4af);
  color: #071115;
}

.danger-action {
  border: 1px solid rgb(237 138 125 / 0.25);
  background: rgb(237 138 125 / 0.08);
  color: var(--studio-warning);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.problem {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0.9rem 1rem 0;
  padding: 0.76rem 1rem;
  border: 1px solid rgb(237 138 125 / 0.34);
  border-radius: 12px;
  background: rgb(237 138 125 / 0.08);
  color: var(--studio-danger);
}

.problem button {
  margin-left: auto;
  border: 0;
  border-radius: 999px;
  background: #b73731;
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 950;
  padding: 0.45rem 0.75rem;
}

.builder-grid {
  display: grid;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
}

.editor-panel,
.inspector-panel {
  min-width: 0;
  overflow: auto;
  padding: 1rem;
}

.editor-panel {
  border-right: 1px solid var(--studio-line);
}

.surface-card,
.inspector-card,
.lesson-drawer {
  border: 1px solid var(--studio-line);
  border-radius: var(--studio-radius);
  background: rgb(255 255 255 / 0.035);
  box-shadow: var(--studio-shadow);
}

:global([data-theme="light"]) .surface-card,
:global([data-theme="light"]) .inspector-card,
:global([data-theme="light"]) .lesson-drawer,
:global([data-theme="light"]) .course-item,
:global([data-theme="light"]) .create-course form,
.studio-shell--light .surface-card,
.studio-shell--light .inspector-card,
.studio-shell--light .lesson-drawer,
.studio-shell--light .course-item,
.studio-shell--light .create-course form {
  background: rgb(255 255 255 / 0.8);
}

.studio-shell--light .module-card {
  background: rgb(255 255 255 / 0.72);
}

.studio-shell--light .module-head {
  background: rgb(246 250 249 / 0.95);
}

.course-card {
  margin-bottom: 1rem;
  padding: 1rem;
}

.course-card__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 210px;
  gap: 0.95rem;
}

.field {
  display: grid;
  gap: 0.42rem;
  min-width: 0;
  color: var(--studio-muted);
  font-weight: 900;
}

.field--description {
  grid-column: 1 / -1;
}

.input-shell,
.rich-editor,
.duration-field {
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: rgb(0 0 0 / 0.14);
}

:global([data-theme="light"]) .input-shell,
:global([data-theme="light"]) .rich-editor,
:global([data-theme="light"]) .duration-field,
.studio-shell--light .input-shell,
.studio-shell--light .rich-editor,
.studio-shell--light .duration-field {
  background: #fffefa;
}

.input-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.input-shell--select {
  grid-template-columns: auto minmax(0, 1fr);
}

.input-shell b,
.input-shell i {
  padding-inline: 0.82rem;
  color: var(--studio-accent);
  font-style: normal;
}

input,
textarea,
select {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: rgb(0 0 0 / 0.14);
  color: var(--studio-text);
  font: inherit;
  font-weight: 850;
  outline: none;
  padding: 0.72rem 0.82rem;
  transition: all 160ms ease;
}

:global([data-theme="light"]) input,
:global([data-theme="light"]) textarea,
:global([data-theme="light"]) select,
.studio-shell--light input,
.studio-shell--light textarea,
.studio-shell--light select {
  background: #fffefa;
  color: var(--studio-text);
}

input:disabled,
textarea:disabled,
select:disabled {
  background: color-mix(in srgb, var(--studio-panel-3) 70%, transparent);
  color: var(--studio-dim);
}

.input-shell input,
.input-shell select,
.duration-field input,
.search-box input {
  border: 0;
  background: transparent;
}

textarea {
  min-height: 98px;
  resize: vertical;
}

.rich-editor textarea {
  min-height: 112px;
  border: 0;
  border-top: 1px solid var(--studio-line);
  border-radius: 0;
  background: transparent;
}

.rich-editor small {
  display: block;
  margin: -1.8rem 0.75rem 0.55rem auto;
  width: fit-content;
}

.rich-toolbar {
  display: flex;
  gap: 0.9rem;
  padding: 0.6rem 0.82rem;
  color: var(--studio-soft);
}

input::placeholder,
textarea::placeholder {
  color: var(--studio-dim);
}

input:focus,
textarea:focus,
select:focus,
.input-shell:focus-within,
.rich-editor:focus-within,
.duration-field:focus-within {
  border-color: rgb(137 220 230 / 0.56);
  box-shadow: 0 0 0 3px rgb(137 220 230 / 0.08);
}

.structure-card {
  padding: 1rem;
}

.tabs-row {
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.tabs {
  display: flex;
  gap: 0.48rem;
}

.authoring-lane {
  display: grid;
  gap: 1rem;
}

.authoring-lane--with-lesson {
  grid-template-columns: minmax(0, 1fr);
}

.modules-column {
  min-width: 0;
}

.inline-create,
.module-edit {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.55rem;
}

.inline-create {
  margin-bottom: 0.72rem;
}

.module-edit {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  padding: 0 0.65rem 0.65rem;
}

.inline-create button,
.module-edit button {
  min-height: 42px;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: rgb(137 220 230 / 0.12);
  color: var(--studio-accent);
  padding: 0 0.86rem;
}

.inline-create button:hover,
.module-edit button:hover {
  border-color: rgb(137 220 230 / 0.42);
  background: rgb(137 220 230 / 0.18);
}

.studio-shell--light .inline-create button,
.studio-shell--light .module-edit button {
  background: rgb(137 220 230 / 0.2);
  color: #17606d;
}

.module-card {
  overflow: hidden;
  margin-top: 0.72rem;
  border: 1px solid var(--studio-line);
  border-radius: 12px;
  background: rgb(255 255 255 / 0.03);
}

.module-head {
  gap: 0.62rem;
  min-height: 56px;
  background: rgb(255 255 255 / 0.045);
  padding: 0.55rem 0.65rem;
}

.node-button {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: 22px minmax(0, 1fr) auto 22px;
  align-items: center;
  gap: 0.62rem;
  border: 0;
  background: transparent;
  color: var(--studio-text);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.node-button strong,
.lesson-item strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drag-handle,
.collapse-mark {
  color: var(--studio-dim);
}

.node-actions,
.lesson-actions {
  flex-shrink: 0;
  gap: 0.32rem;
}

.node-actions button,
.lesson-actions button {
  display: grid;
  min-width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 8px;
  padding: 0 0.42rem;
}

.node-actions .danger-link,
.lesson-actions .danger-link {
  border-color: rgb(237 138 125 / 0.24);
  color: var(--studio-danger);
}

.lesson-list {
  display: grid;
  gap: 0.18rem;
  padding: 0 0.65rem 0.65rem;
}

.lesson-row {
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 160ms ease;
}

.lesson-row:hover,
.lesson-row.active {
  border-color: rgb(137 220 230 / 0.34);
  background: rgb(137 220 230 / 0.08);
}

.lesson-item {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: 48px minmax(0, 1fr) 74px 58px 22px;
  align-items: center;
  gap: 0.58rem;
  border: 0;
  background: transparent;
  color: var(--studio-text);
  cursor: pointer;
  font: inherit;
  padding: 0.56rem 0.58rem;
  text-align: left;
}

.lesson-position {
  color: var(--studio-muted);
  font-weight: 950;
}

.lesson-type {
  width: fit-content;
  border-radius: 8px;
  background: rgb(137 220 230 / 0.1);
  color: var(--studio-accent);
  padding: 0.18rem 0.5rem;
}

.lesson-status {
  display: grid;
  width: 21px;
  height: 21px;
  place-items: center;
  border: 1px solid rgb(137 220 230 / 0.52);
  border-radius: 999px;
  color: var(--studio-accent);
  font-size: 0.76rem;
}

.lesson-create {
  grid-template-columns: minmax(0, 1fr) 88px auto;
  padding: 0 0.65rem 0.65rem;
}

.lesson-drawer {
  display: grid;
  align-content: start;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.82rem;
  margin-top: 1rem;
  order: -1;
  padding: 1rem;
}

.lesson-drawer h2,
.lesson-drawer .field:first-of-type,
.lesson-drawer .field:nth-of-type(4),
.lesson-drawer .check-row,
.lesson-drawer .primary-action {
  grid-column: 1 / -1;
}

.lesson-drawer textarea {
  min-height: 96px;
}

.duration-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 62px;
  align-items: center;
}

.duration-field span {
  display: grid;
  height: 100%;
  place-items: center;
  border-left: 1px solid var(--studio-line);
  color: var(--studio-muted);
  font-weight: 950;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--studio-muted);
  font-weight: 900;
}

.check-row input {
  width: auto;
}

.inspector-panel {
  display: grid;
  align-content: start;
  gap: 1rem;
}

.inspector-card {
  display: grid;
  gap: 1rem;
  padding: 1.05rem;
}

.readiness-body {
  gap: 1rem;
}

.readiness-ring {
  --progress: 0%;
  display: grid;
  width: 72px;
  height: 72px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  background:
    radial-gradient(circle, var(--studio-panel) 57%, transparent 59%),
    conic-gradient(var(--studio-accent) var(--progress), rgb(255 255 255 / 0.08) 0);
  color: var(--studio-text);
  font-weight: 1000;
}

.checklist {
  display: grid;
  gap: 0.78rem;
}

.checklist li {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: start;
  gap: 0.62rem;
  color: var(--studio-soft);
  font-weight: 900;
}

.checklist li > span {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 1px solid rgb(228 185 102 / 0.36);
  border-radius: 999px;
  color: var(--studio-warning);
  font-size: 0.78rem;
}

.checklist li.done > span {
  border-color: rgb(137 220 230 / 0.46);
  color: var(--studio-accent);
}

.status-card .primary-action,
.status-card .ghost-action,
.status-card .danger-action {
  width: 100%;
}

.empty-sidebar,
.empty-editor,
.skeleton-list {
  display: grid;
  gap: 0.5rem;
  color: var(--studio-muted);
}

.empty-sidebar,
.skeleton-list {
  padding: 0 1rem 1rem;
}

.empty-editor {
  min-height: 220px;
  place-content: center;
  border: 1px dashed var(--studio-line);
  border-radius: 14px;
  text-align: center;
}

.empty-editor--large {
  min-height: calc(100dvh - 130px);
}

.editor-skeleton,
.skeleton-list {
  gap: 0.75rem;
}

.editor-skeleton span,
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
  animation: shimmer 1.25s infinite linear;
}

.editor-skeleton span {
  height: 120px;
}

@keyframes shimmer {
  0%,
  100% {
    opacity: 0.55;
    transform: translateX(-2px);
  }
  50% {
    opacity: 1;
    transform: translateX(2px);
  }
}

@media (max-width: 1380px) {
  .lesson-drawer {
    position: static;
  }
}

@media (max-width: 1180px) {
  .studio-shell {
    grid-template-columns: 68px minmax(250px, 292px) minmax(0, 1fr);
  }

  .builder-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .inspector-panel {
    border-top: 1px solid var(--studio-line);
  }
}

@media (max-width: 880px) {
  .studio-shell {
    display: block;
    height: auto;
    min-height: 100dvh;
    overflow: auto;
  }

  .icon-rail {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-right: 0;
    border-bottom: 1px solid var(--studio-line);
  }

  .rail-nav,
  .rail-bottom {
    display: flex;
    padding-top: 0;
  }

  .course-sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--studio-line);
  }

  .workspace-main,
  .editor-panel,
  .inspector-panel {
    overflow: visible;
  }

  .workspace-toolbar,
  .toolbar-actions,
  .breadcrumbs,
  .course-card__grid,
  .module-edit,
  .lesson-create {
    align-items: stretch;
    grid-template-columns: 1fr;
    flex-wrap: wrap;
  }

  .lesson-item {
    grid-template-columns: 48px minmax(0, 1fr) 58px;
  }

  .lesson-type,
  .lesson-status {
    display: none;
  }
}

@media (max-width: 620px) {
  .rail-nav .rail-action:nth-child(n + 4),
  .toolbar-actions .save-state,
  .history-buttons,
  .activity-button,
  .menu-button {
    display: none;
  }

  .module-head,
  .lesson-row,
  .readiness-body {
    align-items: stretch;
    flex-direction: column;
  }

  .node-actions,
  .lesson-actions {
    padding: 0 0.58rem 0.58rem;
  }
}
</style>
