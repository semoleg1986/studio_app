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

        <ModuleCard
          v-for="module in modules"
          :key="module.module_id"
          :lesson-form="lessonForm"
          :module="module"
          :mutating="mutating"
          :selected-lesson="selectedLesson"
          :selected-node="selectedNode"
          @add-lesson="$emit('add-lesson', $event)"
          @archive-lesson="(moduleId, lessonId) => $emit('archive-lesson', moduleId, lessonId)"
          @archive-module="$emit('archive-module', $event)"
          @duplicate-lesson="(moduleId, lessonId) => $emit('duplicate-lesson', moduleId, lessonId)"
          @duplicate-module="$emit('duplicate-module', $event)"
          @move-lesson="
            (moduleId, lessonId, direction) => $emit('move-lesson', moduleId, lessonId, direction)
          "
          @move-module="(moduleId, direction) => $emit('move-module', moduleId, direction)"
          @publish-lesson="(moduleId, lesson) => $emit('publish-lesson', moduleId, lesson)"
          @publish-module="$emit('publish-module', $event)"
          @restore-lesson="(moduleId, lesson) => $emit('restore-lesson', moduleId, lesson)"
          @restore-module="$emit('restore-module', $event)"
          @save-module="$emit('save-module', $event)"
          @save-selected-lesson="$emit('save-selected-lesson')"
          @update:lesson-form="$emit('update:lessonForm', $event)"
          @update:module="(moduleArg, patch) => $emit('update:module', moduleArg, patch)"
          @update:selected-lesson="$emit('update:selectedLesson', $event)"
          @update:selected-node="$emit('update:selectedNode', $event)"
        />
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
import ModuleCard from "~/features/course-builder/ui/ModuleCard.vue";

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

function updateModuleForm<K extends keyof ModuleForm>(key: K, value: ModuleForm[K]) {
  emit("update:moduleForm", { [key]: value });
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

.tabs-row {
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
.ghost-action {
  border: 1px solid var(--studio-line);
  background: rgb(0 0 0 / 0.12);
  color: var(--studio-muted);
}

.tab {
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

.ghost-action {
  min-height: 42px;
  border-radius: 12px;
  padding: 0 1rem;
  font-weight: 950;
}

.ghost-action--small {
  min-height: 36px;
  padding-inline: 0.75rem;
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

.inline-create button {
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: rgb(255 255 255 / 0.9);
  color: #111c21;
  cursor: pointer;
  font: inherit;
  font-weight: 950;
  padding: 0 0.9rem;
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

input {
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

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 760px) {
  .inline-create {
    grid-template-columns: 1fr;
  }
}
</style>
