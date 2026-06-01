export type CoursePublishState = "draft" | "published" | "archived" | string;

export interface AdminCourseListItem {
  course_id: string;
  title: string;
  teacher_id: string;
  teacher_display_name: string | null;
  slug: string;
  publish_state: CoursePublishState;
  price: number;
  currency: string;
  modules_count: number;
  lessons_total: number;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  version: number;
}

export interface AdminCourseListResponse {
  items: AdminCourseListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminCourseAuthoringLesson {
  lesson_id: string;
  module_id: string;
  title: string;
  position: number;
  content_type: string;
  estimated_minutes: number | null;
  is_preview: boolean;
  publish_state: CoursePublishState;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface AdminCourseAuthoringModule {
  module_id: string;
  course_id: string;
  title: string;
  position: number;
  lessons_count: number;
  lessons: AdminCourseAuthoringLesson[];
  created_at: string;
  updated_at: string;
  version: number;
}

export interface AdminCourseAuthoringResponse extends AdminCourseListItem {
  modules: AdminCourseAuthoringModule[];
}
