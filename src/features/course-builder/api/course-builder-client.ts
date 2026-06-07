import { useApiClient } from "~/shared/api/use-api-client";
import type {
  AddLessonPayload,
  AddModulePayload,
  CourseMutationResult,
  CreateCoursePayload,
  ReorderLessonsPayload,
  ReorderModulesPayload,
  StudioOffer,
  StudioCourseOfferListResponse,
  StudioCourseAuthoring,
  StudioCourseListResponse,
  UpdateCoursePayload,
  UpdateLessonPayload,
  UpdateModulePayload,
  UpsertDefaultOfferPayload
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
    listCourseOffers(courseId: string) {
      return api.get<StudioCourseOfferListResponse>(
        `/admin/courses/${encodeURIComponent(courseId)}/offers`
      );
    },
    upsertDefaultOffer(courseId: string, payload: UpsertDefaultOfferPayload) {
      return api.post<StudioOffer, UpsertDefaultOfferPayload>(
        `/admin/courses/${encodeURIComponent(courseId)}/offers/default`,
        payload
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
    archiveModule(courseId: string, moduleId: string) {
      return api.post<CourseMutationResult, Record<string, never>>(
        `/admin/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/archive`,
        {}
      );
    },
    duplicateModule(courseId: string, moduleId: string) {
      return api.post<CourseMutationResult, Record<string, never>>(
        `/admin/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/duplicate`,
        {}
      );
    },
    reorderModules(courseId: string, payload: ReorderModulesPayload) {
      return api.post<CourseMutationResult, ReorderModulesPayload>(
        `/admin/courses/${encodeURIComponent(courseId)}/modules/reorder`,
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
    archiveLesson(courseId: string, moduleId: string, lessonId: string) {
      return api.post<CourseMutationResult, Record<string, never>>(
        `/admin/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons/${encodeURIComponent(lessonId)}/archive`,
        {}
      );
    },
    duplicateLesson(courseId: string, moduleId: string, lessonId: string) {
      return api.post<CourseMutationResult, Record<string, never>>(
        `/admin/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons/${encodeURIComponent(lessonId)}/duplicate`,
        {}
      );
    },
    reorderLessons(courseId: string, moduleId: string, payload: ReorderLessonsPayload) {
      return api.post<CourseMutationResult, ReorderLessonsPayload>(
        `/admin/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons/reorder`,
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
