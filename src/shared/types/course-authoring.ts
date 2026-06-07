export type CoursePublishState = "draft" | "published" | "archived" | string;

export interface SeoResponse {
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots: string;
  og_image_url: string | null;
}

export interface CourseResponse {
  course_id: string;
  title: string;
  teacher_id: string;
  teacher_display_name: string | null;
  slug: string;
  description: string | null;
  starts_at: string;
  starts_at_local: string | null;
  duration_days: number;
  access_ttl_days: number | null;
  enrollment_opens_at: string | null;
  enrollment_opens_at_local: string | null;
  enrollment_closes_at: string | null;
  enrollment_closes_at_local: string | null;
  language: string;
  age_min: number | null;
  age_max: number | null;
  level: string;
  tags: string[];
  cover_image_url: string | null;
  is_live_enabled: boolean;
  live_room_template_id: string | null;
  timezone: string;
  max_students: number | null;
  modules_count: number;
  lessons_total: number;
  estimated_duration_hours: number;
  published_at: string | null;
  published_by_admin_id: string | null;
  archived_at: string | null;
  archived_by: string | null;
  publish_state: CoursePublishState;
  viewer_timezone: string | null;
  seo: SeoResponse;
}

export interface AdminCourseListItem {
  course_id: string;
  title: string;
  teacher_id: string;
  teacher_display_name: string | null;
  slug: string;
  publish_state: CoursePublishState;
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
  title: string;
  description: string | null;
  content_type: string;
  content_ref: string | null;
  duration_minutes: number | null;
  is_preview: boolean;
  released_at: string | null;
  status: string;
  position: number;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  version: number;
}

export interface AdminCourseAuthoringModule {
  module_id: string;
  title: string;
  description: string | null;
  is_required: boolean;
  released_at: string | null;
  status: string;
  position: number;
  lessons_count: number;
  lessons: AdminCourseAuthoringLesson[];
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  version: number;
}

export interface AdminCourseAuthoringReadinessCheck {
  code: string;
  label: string;
  passed: boolean;
  detail: string | null;
}

export interface AdminCourseAuthoringReadiness {
  ready_to_publish: boolean;
  checks: AdminCourseAuthoringReadinessCheck[];
}

export interface AdminCourseAuthoringResponse {
  course: CourseResponse;
  modules: AdminCourseAuthoringModule[];
  readiness: AdminCourseAuthoringReadiness;
  has_unpublished_changes: boolean;
  draft_version: number;
  published_version: number | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface StudioOfferMoney {
  currency: string;
  discount_reason: string | null;
  list_price: number;
  sale_price: number;
}

export interface StudioOfferFeatureFlags {
  delivery_mode: string;
  homework_review_included: boolean;
  teacher_included: boolean;
}

export interface StudioCourseOffer {
  course_id: string;
  description_short: string | null;
  feature_flags: StudioOfferFeatureFlags;
  is_active: boolean;
  is_default: boolean;
  offer_code: string;
  offer_id: string;
  price: StudioOfferMoney;
  title: string;
}

export interface StudioCourseOffersResponse {
  course_id: string;
  offers: StudioCourseOffer[];
}
