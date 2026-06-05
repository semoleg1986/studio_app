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
              <LessonRow
                :lesson="lesson"
                :module-position="module.position"
                :mutating="mutating"
                :selected="
                  selectedNode.type === 'lesson' && selectedNode.lessonId === lesson.lesson_id
                "
                @archive="$emit('archive-lesson', module.module_id, lesson.lesson_id)"
                @duplicate="$emit('duplicate-lesson', module.module_id, lesson.lesson_id)"
                @move="$emit('move-lesson', module.module_id, lesson.lesson_id, $event)"
                @restore="$emit('restore-lesson', module.module_id, lesson)"
                @select="
                  $emit('update:selectedNode', {
                    type: 'lesson',
                    moduleId: module.module_id,
                    lessonId: lesson.lesson_id
                  })
                "
              />
              <LessonInlineEditor
                v-if="
                  selectedNode.type === 'lesson' &&
                  selectedNode.lessonId === lesson.lesson_id &&
                  selectedLesson
                "
                :lesson="selectedLesson"
                :lesson-position="lesson.position"
                :module-position="module.position"
                :mutating="mutating"
                @archive="$emit('archive-lesson', module.module_id, selectedLesson.lesson_id)"
                @publish="$emit('publish-lesson', module.module_id, selectedLesson)"
                @restore="$emit('restore-lesson', module.module_id, selectedLesson)"
                @save="$emit('save-selected-lesson')"
                @update:lesson="emit('update:selectedLesson', $event)"
              />
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
import LessonInlineEditor from "~/features/course-builder/ui/LessonInlineEditor.vue";
import LessonRow from "~/features/course-builder/ui/LessonRow.vue";
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

function updateModule(module: StudioCourseModule, patch: ModulePatch) {
  emit("update:module", module, patch);
}

function updateModuleForm<K extends keyof ModuleForm>(key: K, value: ModuleForm[K]) {
  emit("update:moduleForm", { [key]: value });
}

function updateLessonForm<K extends keyof LessonForm>(key: K, value: LessonForm[K]) {
  emit("update:lessonForm", { [key]: value });
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
.node-actions {
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

.node-state {
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

.state-chip[data-state="published"] {
  color: var(--studio-success);
}

.state-chip[data-state="archived"] {
  color: var(--studio-dim);
}

.field {
  display: grid;
  gap: 0.46rem;
}

.input-shell {
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
.input-shell select {
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
