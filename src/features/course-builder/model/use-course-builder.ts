import { useCourseBuilderClient } from "~/features/course-builder/api/course-builder-client";
import type {
  AddLessonPayload,
  AddModulePayload,
  CourseBuilderSelectedNode,
  StudioCourse,
  StudioCourseAuthoring,
  StudioCourseLesson,
  StudioCourseModule,
  UpdateCoursePayload,
  UpdateLessonPayload,
  UpdateModulePayload
} from "~/features/course-builder/model/types";
import { useAuthSession } from "~/features/auth";
import { ApiRequestError } from "~/shared/api/types";

type CourseFilter = "all" | "draft" | "published" | "archived";

type CourseFormState = {
  description: string;
  level: string;
  price: number;
  title: string;
};

type ModuleFormState = {
  description: string;
  title: string;
};

type LessonFormState = {
  content_type: string;
  description: string;
  duration_minutes: number;
  is_preview: boolean;
  title: string;
};

type BuilderSnapshot = {
  authoring: StudioCourseAuthoring | null;
  courseForm: CourseFormState;
  lessonForm: LessonFormState;
  moduleForm: ModuleFormState;
  selectedCourseId: string | null;
  selectedNode: CourseBuilderSelectedNode;
};

const MAX_HISTORY_ENTRIES = 60;

function tomorrowIso() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setMinutes(0, 0, 0);
  return date.toISOString();
}

function errorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.apiError.statusMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Не удалось выполнить действие";
}

export function useCourseBuilder() {
  const api = useCourseBuilderClient();
  const { user } = useAuthSession();

  const courses = ref<StudioCourse[]>([]);
  const authoring = ref<StudioCourseAuthoring | null>(null);
  const selectedCourseId = ref<string | null>(null);
  const selectedNode = ref<CourseBuilderSelectedNode>({ type: "course" });
  const filter = ref<CourseFilter>("all");
  const search = ref("");
  const loadingCourses = ref(false);
  const loadingAuthoring = ref(false);
  const mutating = ref(false);
  const lastSavedAt = ref<string | null>(null);
  const error = ref<string | null>(null);
  const undoStack = ref<BuilderSnapshot[]>([]);
  const redoStack = ref<BuilderSnapshot[]>([]);

  const createCourseForm = reactive({
    title: "",
    description: "",
    level: "beginner",
    price: 0
  });

  const courseForm = reactive({
    title: "",
    description: "",
    level: "beginner",
    price: 0
  });

  const moduleForm = reactive({
    title: "",
    description: ""
  });

  const lessonForm = reactive({
    title: "",
    description: "",
    content_type: "video",
    duration_minutes: 15,
    is_preview: false
  });

  const total = computed(() => courses.value.length);
  const selectedCourse = computed(() => authoring.value?.course ?? null);
  const modules = computed(() => authoring.value?.modules ?? []);
  const selectedModule = computed<StudioCourseModule | null>(() => {
    if (selectedNode.value.type === "module" || selectedNode.value.type === "lesson") {
      return modules.value.find((item) => item.module_id === selectedNode.value.moduleId) ?? null;
    }
    return null;
  });
  const selectedLesson = computed<StudioCourseLesson | null>(() => {
    if (selectedNode.value.type !== "lesson") {
      return null;
    }
    return (
      selectedModule.value?.lessons.find(
        (item) => item.lesson_id === selectedNode.value.lessonId
      ) ?? null
    );
  });

  const readiness = computed(() => {
    return (
      authoring.value?.readiness.checks.map((check) => ({
        detail: check.detail,
        done: check.passed,
        label: check.label
      })) ?? []
    );
  });
  const readyToPublish = computed(() => authoring.value?.readiness.ready_to_publish ?? false);
  const hasUnpublishedChanges = computed(() => authoring.value?.has_unpublished_changes ?? false);
  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  watch(authoring, (value) => {
    if (!value) {
      courseForm.title = "";
      courseForm.description = "";
      courseForm.level = "beginner";
      courseForm.price = 0;
      return;
    }

    courseForm.title = value.course.title;
    courseForm.description = value.course.description ?? "";
    courseForm.level = value.course.level;
    courseForm.price = value.course.price;
  });

  function cloneState<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  function createSnapshot(): BuilderSnapshot {
    return {
      authoring: cloneState(authoring.value),
      courseForm: cloneState(courseForm),
      lessonForm: cloneState(lessonForm),
      moduleForm: cloneState(moduleForm),
      selectedCourseId: selectedCourseId.value,
      selectedNode: cloneState(selectedNode.value)
    };
  }

  function applySnapshot(snapshot: BuilderSnapshot) {
    authoring.value = cloneState(snapshot.authoring);
    Object.assign(courseForm, cloneState(snapshot.courseForm));
    Object.assign(moduleForm, cloneState(snapshot.moduleForm));
    Object.assign(lessonForm, cloneState(snapshot.lessonForm));
    selectedCourseId.value = snapshot.selectedCourseId;
    selectedNode.value = cloneState(snapshot.selectedNode);
  }

  function resetHistory() {
    undoStack.value = [];
    redoStack.value = [];
  }

  function recordHistory() {
    const snapshot = createSnapshot();
    const previous = undoStack.value.at(-1);
    if (previous && JSON.stringify(previous) === JSON.stringify(snapshot)) {
      return;
    }

    undoStack.value.push(snapshot);
    if (undoStack.value.length > MAX_HISTORY_ENTRIES) {
      undoStack.value.shift();
    }
    redoStack.value = [];
  }

  function undo() {
    const previous = undoStack.value.pop();
    if (!previous) {
      return;
    }
    redoStack.value.push(createSnapshot());
    applySnapshot(previous);
  }

  function redo() {
    const next = redoStack.value.pop();
    if (!next) {
      return;
    }
    undoStack.value.push(createSnapshot());
    applySnapshot(next);
  }

  async function refreshCourses() {
    loadingCourses.value = true;
    error.value = null;
    try {
      const response = await api.listCourses({
        limit: 100,
        offset: 0,
        publish_state: filter.value === "all" ? undefined : filter.value,
        q: search.value.trim() || undefined
      });
      courses.value = response.items;

      if (!selectedCourseId.value && response.items[0]) {
        await selectCourse(response.items[0].course_id);
      }
      if (
        selectedCourseId.value &&
        !response.items.some((course) => course.course_id === selectedCourseId.value)
      ) {
        authoring.value = null;
        selectedCourseId.value = null;
        resetHistory();
      }
    } catch (caught) {
      error.value = errorMessage(caught);
    } finally {
      loadingCourses.value = false;
    }
  }

  async function refreshAuthoring() {
    if (!selectedCourseId.value) {
      return;
    }
    loadingAuthoring.value = true;
    error.value = null;
    try {
      authoring.value = await api.getAuthoring(selectedCourseId.value);
      resetHistory();
    } catch (caught) {
      error.value = errorMessage(caught);
    } finally {
      loadingAuthoring.value = false;
    }
  }

  async function selectCourse(courseId: string) {
    selectedCourseId.value = courseId;
    selectedNode.value = { type: "course" };
    resetHistory();
    await refreshAuthoring();
  }

  async function runMutation(action: () => Promise<unknown>) {
    mutating.value = true;
    error.value = null;
    try {
      await action();
      lastSavedAt.value = new Date().toISOString();
      await refreshCourses();
      await refreshAuthoring();
      resetHistory();
    } catch (caught) {
      error.value = errorMessage(caught);
    } finally {
      mutating.value = false;
    }
  }

  async function createCourse() {
    const title = createCourseForm.title.trim();
    if (!title || !user.value) {
      error.value = "Заполните название курса";
      return;
    }

    await runMutation(async () => {
      const created = await api.createCourse({
        title,
        description: createCourseForm.description.trim() || null,
        teacher_id: user.value?.user_id ?? "",
        teacher_display_name: user.value?.email ?? null,
        starts_at: tomorrowIso(),
        duration_days: 30,
        price: Number(createCourseForm.price) || 0,
        currency: "USD",
        language: "ru",
        level: createCourseForm.level,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      });
      selectedCourseId.value = created.course_id;
      selectedNode.value = { type: "course" };
      createCourseForm.title = "";
      createCourseForm.description = "";
      createCourseForm.price = 0;
    });
  }

  async function saveCourse() {
    if (!selectedCourseId.value) {
      return;
    }
    const payload: UpdateCoursePayload = {
      title: courseForm.title.trim(),
      description: courseForm.description.trim() || null,
      level: courseForm.level,
      price: Number(courseForm.price) || 0,
      currency: "USD",
      language: "ru"
    };
    await runMutation(() => api.updateCourse(selectedCourseId.value as string, payload));
  }

  async function addModule() {
    if (!selectedCourseId.value || !moduleForm.title.trim()) {
      error.value = "Введите название модуля";
      return;
    }
    const payload: AddModulePayload = {
      title: moduleForm.title.trim(),
      description: moduleForm.description.trim() || null,
      is_required: true
    };
    await runMutation(() => api.addModule(selectedCourseId.value as string, payload));
    moduleForm.title = "";
    moduleForm.description = "";
  }

  async function saveModule(module: StudioCourseModule) {
    if (!selectedCourseId.value) {
      return;
    }
    const payload: UpdateModulePayload = {
      title: module.title,
      description: module.description,
      is_required: module.is_required,
      status: module.status
    };
    await runMutation(() =>
      api.updateModule(selectedCourseId.value as string, module.module_id, payload)
    );
  }

  async function archiveModule(moduleId: string) {
    if (!selectedCourseId.value) {
      return;
    }
    await runMutation(() => api.archiveModule(selectedCourseId.value as string, moduleId));
  }

  async function publishModule(module: StudioCourseModule) {
    if (!selectedCourseId.value) {
      return;
    }
    const payload: UpdateModulePayload = {
      title: module.title,
      description: module.description,
      is_required: module.is_required,
      status: "published"
    };
    await runMutation(() =>
      api.updateModule(selectedCourseId.value as string, module.module_id, payload)
    );
  }

  async function restoreModule(module: StudioCourseModule) {
    if (!selectedCourseId.value) {
      return;
    }
    const payload: UpdateModulePayload = {
      title: module.title,
      description: module.description,
      is_required: module.is_required,
      status: "draft"
    };
    await runMutation(() =>
      api.updateModule(selectedCourseId.value as string, module.module_id, payload)
    );
  }

  async function duplicateModule(moduleId: string) {
    if (!selectedCourseId.value) {
      return;
    }
    await runMutation(() => api.duplicateModule(selectedCourseId.value as string, moduleId));
  }

  async function moveModule(moduleId: string, direction: -1 | 1) {
    if (!selectedCourseId.value) {
      return;
    }
    const current = modules.value;
    const index = current.findIndex((module) => module.module_id === moduleId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= current.length) {
      return;
    }
    const next = [...current];
    const [moved] = next.splice(index, 1);
    if (!moved) {
      return;
    }
    next.splice(targetIndex, 0, moved);
    await runMutation(() =>
      api.reorderModules(selectedCourseId.value as string, {
        items: next.map((module, itemIndex) => ({
          module_id: module.module_id,
          position: itemIndex + 1
        }))
      })
    );
  }

  async function addLesson(moduleId: string) {
    if (!selectedCourseId.value || !lessonForm.title.trim()) {
      error.value = "Введите название урока";
      return;
    }
    const payload: AddLessonPayload = {
      title: lessonForm.title.trim(),
      description: lessonForm.description.trim() || null,
      content_type: lessonForm.content_type,
      duration_minutes: Number(lessonForm.duration_minutes) || null,
      is_preview: lessonForm.is_preview
    };
    await runMutation(() => api.addLesson(selectedCourseId.value as string, moduleId, payload));
    lessonForm.title = "";
    lessonForm.description = "";
    lessonForm.duration_minutes = 15;
    lessonForm.is_preview = false;
  }

  async function saveLesson(moduleId: string, lesson: StudioCourseLesson) {
    if (!selectedCourseId.value) {
      return;
    }
    const payload: UpdateLessonPayload = {
      title: lesson.title,
      description: lesson.description,
      content_type: lesson.content_type,
      content_ref: lesson.content_ref,
      duration_minutes: lesson.duration_minutes,
      is_preview: lesson.is_preview,
      status: lesson.status
    };
    await runMutation(() =>
      api.updateLesson(selectedCourseId.value as string, moduleId, lesson.lesson_id, payload)
    );
  }

  async function archiveLesson(moduleId: string, lessonId: string) {
    if (!selectedCourseId.value) {
      return;
    }
    await runMutation(() =>
      api.archiveLesson(selectedCourseId.value as string, moduleId, lessonId)
    );
  }

  async function publishLesson(moduleId: string, lesson: StudioCourseLesson) {
    if (!selectedCourseId.value) {
      return;
    }
    const payload: UpdateLessonPayload = {
      title: lesson.title,
      description: lesson.description,
      content_type: lesson.content_type,
      content_ref: lesson.content_ref,
      duration_minutes: lesson.duration_minutes,
      is_preview: lesson.is_preview,
      status: "published"
    };
    await runMutation(() =>
      api.updateLesson(selectedCourseId.value as string, moduleId, lesson.lesson_id, payload)
    );
  }

  async function restoreLesson(moduleId: string, lesson: StudioCourseLesson) {
    if (!selectedCourseId.value) {
      return;
    }
    const payload: UpdateLessonPayload = {
      title: lesson.title,
      description: lesson.description,
      content_type: lesson.content_type,
      content_ref: lesson.content_ref,
      duration_minutes: lesson.duration_minutes,
      is_preview: lesson.is_preview,
      status: "draft"
    };
    await runMutation(() =>
      api.updateLesson(selectedCourseId.value as string, moduleId, lesson.lesson_id, payload)
    );
  }

  async function duplicateLesson(moduleId: string, lessonId: string) {
    if (!selectedCourseId.value) {
      return;
    }
    await runMutation(() =>
      api.duplicateLesson(selectedCourseId.value as string, moduleId, lessonId)
    );
  }

  async function moveLesson(moduleId: string, lessonId: string, direction: -1 | 1) {
    if (!selectedCourseId.value) {
      return;
    }
    const module = modules.value.find((item) => item.module_id === moduleId);
    if (!module) {
      return;
    }
    const index = module.lessons.findIndex((lesson) => lesson.lesson_id === lessonId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= module.lessons.length) {
      return;
    }
    const next = [...module.lessons];
    const [moved] = next.splice(index, 1);
    if (!moved) {
      return;
    }
    next.splice(targetIndex, 0, moved);
    await runMutation(() =>
      api.reorderLessons(selectedCourseId.value as string, moduleId, {
        items: next.map((lesson, itemIndex) => ({
          lesson_id: lesson.lesson_id,
          position: itemIndex + 1
        }))
      })
    );
  }

  async function publishCourse() {
    if (!selectedCourseId.value) {
      return;
    }
    await runMutation(() => api.publishCourse(selectedCourseId.value as string));
  }

  async function archiveCourse() {
    if (!selectedCourseId.value) {
      return;
    }
    await runMutation(() => api.archiveCourse(selectedCourseId.value as string));
  }

  watch([filter, search], () => {
    void refreshCourses();
  });

  onMounted(() => {
    void refreshCourses();
  });

  return {
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
    publishLesson,
    publishModule,
    recordHistory,
    readiness,
    readyToPublish,
    refreshAuthoring,
    refreshCourses,
    redo,
    resetHistory,
    restoreLesson,
    restoreModule,
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
    selectedModule,
    selectedNode,
    total,
    undo
  };
}
