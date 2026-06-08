<template>
  <main :class="['studio-shell', `studio-shell--${resolvedTheme}`]">
    <StudioNavigationRail
      :auth-pending="authPending"
      :theme-mode="themeMode"
      :user-initial="userInitial"
      @logout="onLogout"
      @set-theme="setThemeMode"
    />

    <CourseListPanel
      v-model:filter="filter"
      v-model:search="search"
      :courses="courses"
      :create-course-form="createCourseForm"
      :loading-courses="loadingCourses"
      :mutating="mutating"
      :selected-course-id="selectedCourseId"
      :total="total"
      @create="createCourse"
      @refresh="refreshCourses"
      @select="selectCourse"
      @update:create-course-form="Object.assign(createCourseForm, $event)"
    />

    <section class="workspace-main">
      <CourseBuilderToolbar
        :can-redo="canRedo"
        :can-undo="canUndo"
        :last-saved-at="lastSavedAt"
        :mutating="mutating"
        :ready-to-publish="readyToPublish"
        :selected-course="selectedCourse"
        @preview="previewOpen = true"
        @publish="publishCourse"
        @redo="redo"
        @undo="undo"
      />

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
            <CourseDetailsCard
              :course-form="courseForm"
              @save="saveCourse"
              @update:course-form="patchCourseForm"
            />

            <CourseStructureEditor
              v-model:selected-node="selectedNode"
              :lesson-form="lessonForm"
              :module-form="moduleForm"
              :modules="modules"
              :mutating="mutating"
              :selected-lesson="selectedLesson"
              @add-lesson="addLesson"
              @add-module="addModule"
              @archive-lesson="archiveLesson"
              @archive-module="archiveModule"
              @duplicate-lesson="duplicateLesson"
              @duplicate-module="duplicateModule"
              @move-lesson="moveLesson"
              @move-module="moveModule"
              @publish-lesson="publishLesson"
              @publish-module="publishModule"
              @refresh="refreshAuthoring"
              @restore-lesson="restoreLesson"
              @restore-module="restoreModule"
              @save-module="saveModule"
              @save-selected-lesson="saveSelectedLesson"
              @update:lesson-form="Object.assign(lessonForm, $event)"
              @update:module="patchModule"
              @update:module-form="Object.assign(moduleForm, $event)"
              @update:selected-lesson="patchSelectedLesson"
            />
          </template>

          <div v-else class="empty-editor empty-editor--large">
            <strong>Выберите курс</strong>
            <span>Или создайте новый курс слева, чтобы начать authoring.</span>
          </div>
        </section>

        <CourseInspector
          :authoring="authoring"
          :draft-version="draftVersion"
          :has-unpublished-changes="hasUnpublishedChanges"
          :mutating="mutating"
          :default-offer="defaultOffer"
          :offer-form="offerForm"
          :published-version="publishedVersion"
          :readiness="readiness"
          :readiness-percent="readinessPercent"
          :ready-to-publish="readyToPublish"
          :selected-course="selectedCourse"
          @archive="archiveCourse"
          @preview="previewOpen = true"
          @publish="publishCourse"
          @save-offer="saveDefaultOffer"
          @update:offer-form="Object.assign(offerForm, $event)"
        />
      </div>
    </section>

    <CoursePreviewDialog :authoring="authoring" :open="previewOpen" @close="previewOpen = false" />
  </main>
</template>

<script setup lang="ts">
import { useAuthSession } from "~/features/auth";
import { useCourseBuilder } from "~/features/course-builder/model/use-course-builder";
import type { StudioCourseLesson, StudioCourseModule } from "~/features/course-builder/model/types";
import CourseBuilderToolbar from "~/features/course-builder/ui/CourseBuilderToolbar.vue";
import CourseDetailsCard from "~/features/course-builder/ui/CourseDetailsCard.vue";
import CourseInspector from "~/features/course-builder/ui/CourseInspector.vue";
import CourseListPanel from "~/features/course-builder/ui/CourseListPanel.vue";
import CoursePreviewDialog from "~/features/course-builder/ui/CoursePreviewDialog.vue";
import CourseStructureEditor from "~/features/course-builder/ui/CourseStructureEditor.vue";
import StudioNavigationRail from "~/features/course-builder/ui/StudioNavigationRail.vue";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";

const { logout, pending: authPending, user } = useAuthSession();
const { resolvedTheme, setThemeMode, themeMode } = usePreferences();
const previewOpen = ref(false);
const {
  addLesson,
  addModule,
  archiveCourse,
  archiveLesson,
  archiveModule,
  authoring,
  canRedo,
  canUndo,
  courseForm,
  courses,
  createCourse,
  createCourseForm,
  defaultOffer,
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
  offerForm,
  publishCourse,
  publishLesson,
  publishModule,
  recordHistory,
  readiness,
  readyToPublish,
  refreshAuthoring,
  refreshCourses,
  redo,
  restoreLesson,
  restoreModule,
  saveCourse,
  saveDefaultOffer,
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
  total,
  undo
} = useCourseBuilder();

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

function saveSelectedLesson() {
  if (selectedNode.value.type !== "lesson" || !selectedLesson.value) {
    return;
  }
  void saveLesson(selectedNode.value.moduleId, selectedLesson.value as StudioCourseLesson);
}

function patchCourseForm(patch: Partial<typeof courseForm>) {
  recordHistory();
  Object.assign(courseForm, patch);
}

function patchModule(
  module: StudioCourseModule,
  patch: Partial<Pick<StudioCourseModule, "description" | "title">>
) {
  recordHistory();
  Object.assign(module, patch);
}

function patchSelectedLesson(
  patch: Partial<
    Pick<
      StudioCourseLesson,
      "content_type" | "description" | "duration_minutes" | "is_preview" | "title"
    >
  >
) {
  if (selectedLesson.value) {
    recordHistory();
    Object.assign(selectedLesson.value, patch);
  }
}

async function onLogout() {
  await logout();
  await navigateTo("/login");
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
  --studio-control-bg: rgb(0 0 0 / 0.12);
  --studio-control-bg-strong: rgb(0 0 0 / 0.18);
  --studio-button-bg: rgb(255 255 255 / 0.9);
  --studio-button-text: #111c21;
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
  --studio-control-bg: #fffefa;
  --studio-control-bg-strong: #f6fbfb;
  --studio-button-bg: rgb(137 220 230 / 0.22);
  --studio-button-text: #17606d;
  --studio-shadow: 0 26px 90px rgb(24 50 58 / 0.13);
}

.workspace-main,
.editor-panel {
  min-height: 0;
  min-width: 0;
}

.workspace-main {
  display: grid;
  grid-template-rows: 78px auto minmax(0, 1fr);
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

.editor-panel {
  overflow: auto;
  padding: 1rem;
  border-right: 1px solid var(--studio-line);
}

.empty-editor,
.editor-skeleton {
  display: grid;
  gap: 0.75rem;
  color: var(--studio-muted);
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

.editor-skeleton span {
  display: block;
  height: 120px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    rgb(255 255 255 / 0.035),
    rgb(137 220 230 / 0.08),
    rgb(255 255 255 / 0.035)
  );
  animation: shimmer 1.25s infinite linear;
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

@media (max-width: 1180px) {
  .studio-shell {
    grid-template-columns: 68px minmax(250px, 292px) minmax(0, 1fr);
  }

  .builder-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .editor-panel {
    border-right: 0;
  }
}

@media (max-width: 880px) {
  .studio-shell {
    display: block;
    height: auto;
    min-height: 100dvh;
    overflow: auto;
  }

  .workspace-main,
  .editor-panel {
    overflow: visible;
  }
}
</style>
