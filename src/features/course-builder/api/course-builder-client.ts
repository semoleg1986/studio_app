import { useApiClient } from "~/shared/api/use-api-client";
import type {
  AddLessonPayload,
  AddModulePayload,
  CourseMutationResult,
  CreateCoursePayload,
  StudioCourseAuthoring,
  StudioCourseListResponse,
  UpdateCoursePayload,
  UpdateLessonPayload,
  UpdateModulePayload
} from "~/features/course-builder/model/types";

export function useCourseBuilderClient() {
  const api = useApiClient();

  return {
    listCourses(query: Record<string, string | number | undefined> = {}) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      }
      const suffix = params.toString() ? `?${params.toString()}` : "";
      return api.get<StudioCourseListResponse>(`/admin/courses${suffix}`);
    },
    getAuthoring(courseId: string) {
      return api.get<StudioCourseAuthoring>(
        `/admin/courses/${encodeURIComponent(courseId)}/authoring`
      );
    },
    createCourse(payload: CreateCoursePayload) {
      return api.post<CourseMutationResult, CreateCoursePayload>("/admin/courses", payload);
    },
    updateCourse(courseId: string, payload: UpdateCoursePayload) {
      return api.patch<CourseMutationResult, UpdateCoursePayload>(
        `/admin/courses/${encodeURIComponent(courseId)}`,
        payload
      );
    },
    addModule(courseId: string, payload: AddModulePayload) {
      return api.post<CourseMutationResult, AddModulePayload>(
        `/admin/courses/${encodeURIComponent(courseId)}/modules`,
        payload
      );
    },
    updateModule(courseId: string, moduleId: string, payload: UpdateModulePayload) {
      return api.patch<CourseMutationResult, UpdateModulePayload>(
        `/admin/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}`,
        payload
      );
    },
    addLesson(courseId: string, moduleId: string, payload: AddLessonPayload) {
      return api.post<CourseMutationResult, AddLessonPayload>(
        `/admin/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons`,
        payload
      );
    },
    updateLesson(
      courseId: string,
      moduleId: string,
      lessonId: string,
      payload: UpdateLessonPayload
    ) {
      return api.patch<CourseMutationResult, UpdateLessonPayload>(
        `/admin/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons/${encodeURIComponent(lessonId)}`,
        payload
      );
    },
    publishCourse(courseId: string) {
      return api.post<CourseMutationResult, Record<string, never>>(
        `/admin/courses/${encodeURIComponent(courseId)}/publish`,
        {}
      );
    },
    archiveCourse(courseId: string) {
      return api.post<CourseMutationResult, Record<string, never>>(
        `/admin/courses/${encodeURIComponent(courseId)}/archive`,
        {}
      );
    }
  };
}
