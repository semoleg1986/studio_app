<template>
  <article class="module-card">
    <ModuleHeader
      :module="module"
      :mutating="mutating"
      @archive-module="$emit('archive-module', $event)"
      @duplicate-module="$emit('duplicate-module', $event)"
      @move-module="(moduleId, direction) => $emit('move-module', moduleId, direction)"
      @publish-module="$emit('publish-module', $event)"
      @restore-module="$emit('restore-module', $event)"
      @update:selected-node="$emit('update:selectedNode', $event)"
    />

    <ModuleEditForm
      :module="module"
      :mutating="mutating"
      @save="$emit('save-module', module)"
      @update:module="updateModule"
    />

    <ul class="lesson-list">
      <li v-for="lesson in module.lessons" :key="lesson.lesson_id">
        <LessonRow
          :lesson="lesson"
          :module-position="module.position"
          :mutating="mutating"
          :selected="selectedNode.type === 'lesson' && selectedNode.lessonId === lesson.lesson_id"
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
          @update:lesson="$emit('update:selectedLesson', $event)"
        />
      </li>
    </ul>

    <LessonCreateForm
      :lesson-form="lessonForm"
      :mutating="mutating"
      @add-lesson="$emit('add-lesson', module.module_id)"
      @update:lesson-form="$emit('update:lessonForm', $event)"
    />
  </article>
</template>

<script setup lang="ts">
import type {
  CourseBuilderSelectedNode,
  StudioCourseLesson,
  StudioCourseModule
} from "~/features/course-builder/model/types";
import LessonCreateForm from "~/features/course-builder/ui/LessonCreateForm.vue";
import LessonInlineEditor from "~/features/course-builder/ui/LessonInlineEditor.vue";
import LessonRow from "~/features/course-builder/ui/LessonRow.vue";
import ModuleEditForm from "~/features/course-builder/ui/ModuleEditForm.vue";
import ModuleHeader from "~/features/course-builder/ui/ModuleHeader.vue";

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
  "archive-lesson": [moduleId: string, lessonId: string];
  "archive-module": [moduleId: string];
  "duplicate-lesson": [moduleId: string, lessonId: string];
  "duplicate-module": [moduleId: string];
  "move-lesson": [moduleId: string, lessonId: string, direction: -1 | 1];
  "move-module": [moduleId: string, direction: -1 | 1];
  "publish-lesson": [moduleId: string, lesson: StudioCourseLesson];
  "publish-module": [module: StudioCourseModule];
  "restore-lesson": [moduleId: string, lesson: StudioCourseLesson];
  "restore-module": [module: StudioCourseModule];
  "save-module": [module: StudioCourseModule];
  "save-selected-lesson": [];
  "update:lessonForm": [patch: Partial<LessonForm>];
  "update:selectedLesson": [patch: LessonPatch];
  "update:selectedNode": [node: CourseBuilderSelectedNode];
  "update:module": [module: StudioCourseModule, patch: ModulePatch];
}>();

const props = defineProps<{
  lessonForm: LessonForm;
  module: StudioCourseModule;
  mutating: boolean;
  selectedLesson: StudioCourseLesson | null;
  selectedNode: CourseBuilderSelectedNode;
}>();

function updateModule(patch: ModulePatch) {
  emit("update:module", props.module, patch);
}
</script>

<style scoped>
.module-card {
  overflow: hidden;
  border: 1px solid var(--studio-line);
  border-radius: 14px;
  background: rgb(255 255 255 / 0.035);
}

.lesson-list {
  display: grid;
  gap: 0.18rem;
  margin: 0;
  padding: 0 0.65rem 0.65rem;
  list-style: none;
}
</style>
