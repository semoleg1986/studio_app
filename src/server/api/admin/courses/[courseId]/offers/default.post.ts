import { getRouterParam, readBody, setHeader, setResponseStatus } from "h3";

import { canManageCourseOffers } from "~/features/auth";
import { proxyCommercialCatalogJson } from "~/server/utils/commercial-catalog-proxy";
import { proxyCourseServiceJson } from "~/server/utils/course-service-proxy";
import { proxyMe } from "~/server/utils/auth-proxy";
import type { StudioCourseOffer } from "~/shared/types/course-authoring";

interface UpsertDefaultOfferBody {
  currency?: string;
  description_short?: string | null;
  is_active?: boolean;
  list_price?: number;
  offer_id?: string | null;
  sale_price?: number;
  title?: string;
}

export default defineEventHandler(async (event) => {
  const courseId = getRouterParam(event, "courseId");

  if (!courseId) {
    setResponseStatus(event, 400, "Bad Request");
    return {
      detail: "course_id is required",
      status: 400,
      title: "Bad Request",
      type: "/problems/validation"
    };
  }

  const user = await proxyMe(event);

  if (!("roles" in user)) {
    return user;
  }

  if (!canManageCourseOffers(user)) {
    setResponseStatus(event, 403, "Forbidden");
    setHeader(event, "Content-Type", "application/problem+json");
    return {
      detail: "Offer management requires admin role.",
      instance: `/api/admin/courses/${encodeURIComponent(courseId)}/offers/default`,
      status: 403,
      title: "Access denied",
      type: "https://api.example.com/problems/access-denied"
    };
  }

  const authoringAccess = await proxyCourseServiceJson<Record<string, unknown>>(
    event,
    `/v1/admin/courses/${encodeURIComponent(courseId)}/authoring`
  );

  if (typeof authoringAccess.status === "number" && authoringAccess.status >= 400) {
    return authoringAccess;
  }

  const body = (await readBody(event)) as UpsertDefaultOfferBody;
  const offerId = body.offer_id?.trim() || `${courseId}-standard`;
  const title = body.title?.trim() || "Standard offer";
  const description = body.description_short?.trim() || "Standard course access";
  const currency = (body.currency?.trim() || "USD").toUpperCase();
  const listPrice = Number(body.list_price ?? body.sale_price ?? 0);
  const salePrice = Number(body.sale_price ?? listPrice);

  return await proxyCommercialCatalogJson<StudioCourseOffer>(event, "/internal/v1/course-offers", {
    actor: {
      email: user.email,
      roles: user.roles,
      userId: user.user_id
    },
    body: {
      course_id: courseId,
      currency,
      description_short: description,
      homework_review_included: false,
      is_active: body.is_active ?? true,
      is_default: true,
      list_price: listPrice,
      offer_code: "standard",
      offer_id: offerId,
      sale_price: salePrice,
      sort_order: 0,
      teacher_included: false,
      title
    },
    method: "POST"
  });
});
