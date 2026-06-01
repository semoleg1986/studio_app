import { getRequestHeader, setHeader, setResponseStatus } from "h3";
import type { H3Event } from "h3";

import { getAccessToken } from "~/server/utils/auth-session";
import { exchangeRefreshToken } from "~/server/utils/auth-proxy";

interface CourseServiceProxyOptions {
  method?: string;
  query?: Record<string, unknown>;
}

function courseServiceBaseUrl(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event);

  return String(runtimeConfig.courseServiceBaseUrl || "http://localhost:8001").replace(/\/$/, "");
}

function appendQuery(url: URL, query: Record<string, unknown> = {}) {
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== "") {
          url.searchParams.append(key, String(item));
        }
      }
      continue;
    }

    url.searchParams.set(key, String(value));
  }
}

export function buildCourseServiceUrl(
  baseUrl: string,
  path: string,
  query: Record<string, unknown> = {}
) {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}${path}`);
  appendQuery(url, query);

  return url.toString();
}

function forwardTracingHeaders(event: H3Event, headers: Headers) {
  const requestId = getRequestHeader(event, "x-request-id");
  const correlationId = getRequestHeader(event, "x-correlation-id");

  if (requestId) {
    headers.set("X-Request-ID", requestId);
  }

  if (correlationId) {
    headers.set("X-Correlation-ID", correlationId);
  }
}

function setUpstreamTraceHeaders(event: H3Event, response: Response) {
  const requestId = response.headers.get("x-request-id");
  const correlationId = response.headers.get("x-correlation-id");

  if (requestId) {
    setHeader(event, "X-Request-ID", requestId);
  }

  if (correlationId) {
    setHeader(event, "X-Correlation-ID", correlationId);
  }
}

function unauthorizedProblem() {
  return {
    detail: "Authentication required",
    status: 401,
    title: "Unauthorized",
    type: "/problems/unauthorized"
  };
}

async function readUpstreamPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await response.json();
  }

  const detail = await response.text();

  return {
    detail: detail || response.statusText || "Upstream request failed",
    status: response.status,
    title: response.statusText || "Upstream request failed",
    type: "/problems/upstream-error"
  };
}

async function resolveAccessToken(event: H3Event) {
  const accessToken = getAccessToken(event);

  if (accessToken) {
    return accessToken;
  }

  const refreshed = await exchangeRefreshToken(event);

  return refreshed?.access_token ?? null;
}

async function fetchCourseService(
  url: string,
  event: H3Event,
  accessToken: string,
  method: string
) {
  const headers = new Headers({ Accept: "application/json" });
  headers.set("Authorization", `Bearer ${accessToken}`);
  forwardTracingHeaders(event, headers);

  return await fetch(url, {
    headers,
    method
  });
}

export async function proxyCourseServiceJson<TResponse>(
  event: H3Event,
  path: string,
  options: CourseServiceProxyOptions = {}
): Promise<TResponse | Record<string, unknown>> {
  let accessToken = await resolveAccessToken(event);

  if (!accessToken) {
    setResponseStatus(event, 401, "Unauthorized");
    return unauthorizedProblem();
  }

  const url = buildCourseServiceUrl(courseServiceBaseUrl(event), path, options.query);
  const method = options.method ?? "GET";
  let response = await fetchCourseService(url, event, accessToken, method);

  if (response.status === 401) {
    const refreshed = await exchangeRefreshToken(event);

    if (refreshed) {
      accessToken = refreshed.access_token;
      response = await fetchCourseService(url, event, accessToken, method);
    }
  }

  setUpstreamTraceHeaders(event, response);

  if (!response.ok) {
    setResponseStatus(event, response.status, response.statusText);
  }

  return await readUpstreamPayload(response);
}
