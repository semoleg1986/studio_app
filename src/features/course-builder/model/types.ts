import type {
  AdminCourseAuthoringLesson,
  AdminCourseAuthoringModule,
  AdminCourseAuthoringResponse,
  AdminCourseListItem,
  AdminCourseListResponse,
  CourseResponse
} from "~/shared/types/course-authoring";

export type StudioCourse = AdminCourseListItem;
export type StudioCourseListResponse = AdminCourseListResponse;
export type StudioCourseAuthoring = AdminCourseAuthoringResponse;
export type StudioCourseModule = AdminCourseAuthoringModule;
export type StudioCourseLesson = AdminCourseAuthoringLesson;

export interface CreateCoursePayload {
  title: string;
  description?: string | null;
  teacher_id: string;
  teacher_display_name?: string | null;
  starts_at: string;
  duration_days: number;
  price: number;
  currency: string;
  language: string;
  level: string;
  timezone: string;
}

export type UpdateCoursePayload = Partial<{
  title: string;
  description: string | null;
  price: number;
  currency: string;
  level: string;
  language: string;
  timezone: string;
}>;

export interface AddModulePayload {
  title: string;
  description?: string | null;
  is_required?: boolean;
}

export type UpdateModulePayload = Partial<{
  title: string;
  description: string | null;
  is_required: boolean;
  status: string;
}>;

export interface AddLessonPayload {
  title: string;
  description?: string | null;
  content_type?: string;
  content_ref?: string | null;
  duration_minutes?: number | null;
  is_preview?: boolean;
}

export type UpdateLessonPayload = Partial<{
  title: string;
  description: string | null;
  content_type: string;
  content_ref: string | null;
  duration_minutes: number | null;
  is_preview: boolean;
  status: string;
}>;

export type CourseMutationResult = CourseResponse;
