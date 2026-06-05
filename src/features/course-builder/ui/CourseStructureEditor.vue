<template>
  <section class="structure-card surface-card">
    <header class="tabs-row">
      <div class="tabs">
        <button class="tab tab--active" type="button">Модули</button>
        <button class="tab" type="button">
          Уроки <span>{{ lessonCount }}</span>
        </button>
      </div>
      <button class="ghost-action ghost-action--small" type="button" @click="$emit('refresh')">
        Обновить
      </button>
    </header>

    <div :class="['authoring-lane', { 'authoring-lane--with-lesson': selectedLesson }]">
      <div class="modules-column">
        <form class="inline-create" @submit.prevent="$emit('add-module')">
          <input
            :value="moduleForm.title"
            placeholder="Название нового модуля"
            @input="updateModuleForm('title', ($event.target as HTMLInputElement).value)"
          />
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

          <div class="module-edit">
            <input
              :value="module.title"
              @input="updateModule(module, { title: ($event.target as HTMLInputElement).value })"
            />
            <input
              :value="module.description ?? ''"
              placeholder="Описание модуля"
              @input="
                updateModule(module, {
                  description: ($event.target as HTMLInputElement).value || null
                })
              "
            />
            <button type="button" :disabled="mutating" @click="$emit('save-module', module)">
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
                      selectedNode.type === 'lesson' && selectedNode.lessonId === lesson.lesson_id
                  }
                ]"
              >
                <button
                  type="button"
                  class="lesson-item"
                  @click="
                    $emit('update:selectedNode', {
                      type: 'lesson',
                      moduleId: module.module_id,
                      lessonId: lesson.lesson_id
                    })
                  "
                >
                  <span class="lesson-position">{{ module.position }}.{{ lesson.position }}</span>
                  <strong>{{ lesson.title }}</strong>
                  <small class="lesson-type">{{ contentTypeLabel(lesson.content_type) }}</small>
                  <small class="state-chip lesson-state" :data-state="lesson.status">
                    {{ stateLabel(lesson.status) }}
                  </small>
                  <small>{{ lesson.duration_minutes ?? "—" }} мин</small>
                  <span class="lesson-status">✓</span>
                </button>
                <div class="lesson-actions">
                  <button
                    type="button"
                    :disabled="mutating"
                    @click.stop="$emit('move-lesson', module.module_id, lesson.lesson_id, -1)"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    :disabled="mutating"
                    @click.stop="$emit('move-lesson', module.module_id, lesson.lesson_id, 1)"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    :disabled="mutating"
                    @click.stop="$emit('duplicate-lesson', module.module_id, lesson.lesson_id)"
                  >
                    ⧉
                  </button>
                  <button
                    class="danger-link action-pill"
                    type="button"
                    :disabled="mutating || lesson.status === 'archived'"
                    @click.stop="$emit('archive-lesson', module.module_id, lesson.lesson_id)"
                  >
                    В архив
                  </button>
                  <button
                    v-if="lesson.status === 'archived'"
                    class="action-pill action-pill--restore"
                    type="button"
                    :disabled="mutating"
                    @click.stop="$emit('restore-lesson', module.module_id, lesson)"
                  >
                    Вернуть
                  </button>
                </div>
              </div>
              <aside
                v-if="
                  selectedNode.type === 'lesson' &&
                  selectedNode.lessonId === lesson.lesson_id &&
                  selectedLesson
                "
                class="lesson-drawer lesson-drawer--inline"
              >
                <h2>Урок {{ module.position }}.{{ lesson.position }}</h2>
                <label class="field">
                  <span>Название урока</span>
                  <input
                    :value="selectedLesson.title"
                    @input="
                      updateSelectedLesson('title', ($event.target as HTMLInputElement).value)
                    "
                  />
                </label>
                <label class="field">
                  <span>Тип урока</span>
                  <div class="input-shell input-shell--select">
                    <b>▧</b>
                    <select
                      :value="selectedLesson.content_type"
                      @change="
                        updateSelectedLesson(
                          'content_type',
                          ($event.target as HTMLSelectElement).value
                        )
                      "
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
                      :value="selectedLesson.duration_minutes ?? ''"
                      min="1"
                      type="number"
                      @input="
                        updateSelectedLesson(
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
                    :value="selectedLesson.description ?? ''"
                    @input="
                      updateSelectedLesson(
                        'description',
                        ($event.target as HTMLTextAreaElement).value || null
                      )
                    "
                  />
                </label>
                <label class="check-row">
                  <input
                    :checked="selectedLesson.is_preview"
                    type="checkbox"
                    @change="
                      updateSelectedLesson(
                        'is_preview',
                        ($event.target as HTMLInputElement).checked
                      )
                    "
                  />
                  Preview урок
                </label>
                <div class="lesson-editor-actions">
                  <button
                    v-if="selectedLesson.status !== 'published'"
                    class="ghost-action"
                    type="button"
                    :disabled="mutating || selectedLesson.status === 'archived'"
                    @click="$emit('publish-lesson', module.module_id, selectedLesson)"
                  >
                    Опубликовать урок
                  </button>
                  <button
                    v-if="selectedLesson.status === 'archived'"
                    class="ghost-action"
                    type="button"
                    :disabled="mutating"
                    @click="$emit('restore-lesson', module.module_id, selectedLesson)"
                  >
                    Вернуть урок
                  </button>
                  <button
                    class="danger-action"
                    type="button"
                    :disabled="mutating || selectedLesson.status === 'archived'"
                    @click="$emit('archive-lesson', module.module_id, selectedLesson.lesson_id)"
                  >
                    В архив
                  </button>
                  <button
                    class="primary-action"
                    type="button"
                    :disabled="mutating || selectedNode.type !== 'lesson'"
                    @click="$emit('save-selected-lesson')"
                  >
                    Сохранить урок
                  </button>
                </div>
              </aside>
            </li>
          </ul>

          <form
            class="inline-create lesson-create"
            @submit.prevent="$emit('add-lesson', module.module_id)"
          >
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
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  CourseBuilderSelectedNode,
  StudioCourseLesson,
  StudioCourseModule
} from "~/features/course-builder/model/types";
import type { CoursePublishState } from "~/shared/types/course-authoring";

type ModuleForm = {
  description: string;
  title: string;
};

type LessonForm = {
  content_type: string;
  description: string;
  duration_minutes: number;
  is_preview: boolean;
  title: string;
};

type ModulePatch = Partial<Pick<StudioCourseModule, "description" | "title">>;
type LessonPatch = Partial<
  Pick<
    StudioCourseLesson,
    "content_type" | "description" | "duration_minutes" | "is_preview" | "title"
  >
>;

const emit = defineEmits<{
  "add-lesson": [moduleId: string];
  "add-module": [];
  "archive-lesson": [moduleId: string, lessonId: string];
  "archive-module": [moduleId: string];
  "duplicate-lesson": [moduleId: string, lessonId: string];
  "duplicate-module": [moduleId: string];
  "move-lesson": [moduleId: string, lessonId: string, direction: -1 | 1];
  "move-module": [moduleId: string, direction: -1 | 1];
  "publish-lesson": [moduleId: string, lesson: StudioCourseLesson];
  "publish-module": [module: StudioCourseModule];
  refresh: [];
  "restore-lesson": [moduleId: string, lesson: StudioCourseLesson];
  "restore-module": [module: StudioCourseModule];
  "save-module": [module: StudioCourseModule];
  "save-selected-lesson": [];
  "update:lessonForm": [patch: Partial<LessonForm>];
  "update:moduleForm": [patch: Partial<ModuleForm>];
  "update:selectedLesson": [patch: LessonPatch];
  "update:selectedNode": [node: CourseBuilderSelectedNode];
  "update:module": [module: StudioCourseModule, patch: ModulePatch];
}>();

const props = defineProps<{
  lessonForm: LessonForm;
  moduleForm: ModuleForm;
  modules: StudioCourseModule[];
  mutating: boolean;
  selectedLesson: StudioCourseLesson | null;
  selectedNode: CourseBuilderSelectedNode;
}>();

const lessonCount = computed(() =>
  props.modules.reduce((count, module) => count + module.lessons.length, 0)
);

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

function updateModule(module: StudioCourseModule, patch: ModulePatch) {
  emit("update:module", module, patch);
}

function updateModuleForm<K extends keyof ModuleForm>(key: K, value: ModuleForm[K]) {
  emit("update:moduleForm", { [key]: value });
}

function updateLessonForm<K extends keyof LessonForm>(key: K, value: LessonForm[K]) {
  emit("update:lessonForm", { [key]: value });
}

function updateSelectedLesson<K extends keyof LessonPatch>(
  key: K,
  value: NonNullable<LessonPatch[K]>
) {
  emit("update:selectedLesson", { [key]: value } as LessonPatch);
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

.structure-card {
  display: grid;
  min-height: 0;
  padding: 1.05rem;
}

.tabs-row,
.module-head,
.lesson-row,
.node-actions,
.lesson-actions {
  display: flex;
  align-items: center;
}

.tabs-row {
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
}

.tab,
.ghost-action,
.node-actions button,
.lesson-actions button,
.state-chip {
  border: 1px solid var(--studio-line);
  background: rgb(0 0 0 / 0.12);
  color: var(--studio-muted);
}

.tab,
.state-chip {
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 950;
  padding: 0.32rem 0.64rem;
}

.tab--active {
  border-color: rgb(137 220 230 / 0.46);
  background: rgb(137 220 230 / 0.14);
  color: var(--studio-accent);
}

.tab span {
  margin-left: 0.32rem;
  color: var(--studio-soft);
}

.ghost-action,
.primary-action,
.danger-action {
  min-height: 42px;
  border-radius: 12px;
  padding: 0 1rem;
  font-weight: 950;
}

.ghost-action--small {
  min-height: 36px;
  padding-inline: 0.75rem;
}

.primary-action {
  border: 0;
  background: linear-gradient(135deg, var(--studio-accent), var(--studio-accent-2));
  color: #082024;
}

.danger-action {
  border: 1px solid rgb(237 138 125 / 0.24);
  background: rgb(0 0 0 / 0.12);
  color: var(--studio-danger);
}

.authoring-lane {
  display: grid;
  min-height: 0;
  gap: 1rem;
}

.modules-column {
  display: grid;
  min-height: 0;
  align-content: start;
  gap: 0.75rem;
}

.inline-create {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.6rem;
}

.inline-create button,
.module-edit button,
.lesson-create button {
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: rgb(255 255 255 / 0.9);
  color: #111c21;
  cursor: pointer;
  font: inherit;
  font-weight: 950;
  padding: 0 0.9rem;
}

.module-card {
  overflow: hidden;
  border: 1px solid var(--studio-line);
  border-radius: 14px;
  background: rgb(255 255 255 / 0.035);
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

.node-button strong,
.lesson-item strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-button small,
.field span,
.field small,
.lesson-drawer p {
  color: var(--studio-muted);
}

.drag-handle,
.collapse-mark {
  color: var(--studio-dim);
}

.node-actions,
.lesson-actions {
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
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

.node-actions .action-pill,
.lesson-actions .action-pill {
  min-width: auto;
  padding-inline: 0.62rem;
  white-space: nowrap;
}

.node-actions .danger-link,
.lesson-actions .danger-link {
  border-color: rgb(237 138 125 / 0.24);
  color: var(--studio-danger);
}

.node-actions .action-pill--restore,
.lesson-actions .action-pill--restore {
  border-color: rgb(137 220 230 / 0.36);
  color: var(--studio-accent);
}

.node-state,
.lesson-state {
  white-space: nowrap;
}

.module-edit,
.lesson-create {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 0.6rem;
  padding: 0.65rem;
}

.lesson-list {
  display: grid;
  gap: 0.18rem;
  margin: 0;
  padding: 0 0.65rem 0.65rem;
  list-style: none;
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

.state-chip[data-state="published"] {
  color: var(--studio-success);
}

.state-chip[data-state="archived"] {
  color: var(--studio-dim);
}

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

.duration-field span {
  color: var(--studio-muted);
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

.empty-editor {
  display: grid;
  min-height: 220px;
  place-content: center;
  gap: 0.5rem;
  border: 1px dashed var(--studio-line);
  border-radius: 14px;
  color: var(--studio-muted);
  text-align: center;
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
  .inline-create,
  .module-edit,
  .lesson-create,
  .lesson-item {
    grid-template-columns: 1fr;
  }

  .node-button {
    grid-template-columns: 24px minmax(0, 1fr);
  }

  .lesson-drawer--inline {
    margin-left: 0;
  }
}
</style>
