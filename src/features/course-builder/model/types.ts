import type {
  AdminCourseAuthoringLesson,
  AdminCourseAuthoringModule,
  AdminCourseAuthoringResponse,
  AdminCourseListItem,
  AdminCourseListResponse,
  StudioCourseOffer,
  StudioCourseOffersResponse,
  CourseResponse
} from "~/shared/types/course-authoring";

export type StudioCourse = AdminCourseListItem;
export type StudioCourseListResponse = AdminCourseListResponse;
export type StudioCourseAuthoring = AdminCourseAuthoringResponse;
export type StudioCourseModule = AdminCourseAuthoringModule;
export type StudioCourseLesson = AdminCourseAuthoringLesson;
export type StudioOffer = StudioCourseOffer;
export type StudioCourseOfferListResponse = StudioCourseOffersResponse;

export type CourseBuilderSelectedNode =
  | { type: "course" }
  | { type: "module"; moduleId: string }
  | { type: "lesson"; moduleId: string; lessonId: string };

export interface CreateCoursePayload {
  title: string;
  description?: string | null;
  teacher_id: string;
  teacher_display_name?: string | null;
  starts_at: string;
  duration_days: number;
  language: string;
  level: string;
  timezone: string;
}

export type UpdateCoursePayload = Partial<{
  title: string;
  description: string | null;
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

export interface ReorderModuleItemPayload {
  module_id: string;
  position: number;
}

export interface ReorderLessonItemPayload {
  lesson_id: string;
  position: number;
}

export interface ReorderModulesPayload {
  items: ReorderModuleItemPayload[];
}

export interface ReorderLessonsPayload {
  items: ReorderLessonItemPayload[];
}

export interface UpsertDefaultOfferPayload {
  currency: string;
  description_short?: string | null;
  is_active: boolean;
  list_price: number;
  offer_id?: string | null;
  sale_price: number;
  title: string;
}
