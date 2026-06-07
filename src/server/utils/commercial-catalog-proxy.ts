import { getRequestHeader, readBody, setHeader, setResponseStatus } from "h3";
import type { H3Event } from "h3";

import { exchangeRefreshToken } from "~/server/utils/auth-proxy";
import { getAccessToken } from "~/server/utils/auth-session";

interface CatalogProxyOptions {
  body?: unknown;
  method?: string;
}

function catalogBaseUrl(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event);

  return String(runtimeConfig.commercialCatalogServiceBaseUrl || "http://localhost:8007").replace(
    /\/$/,
    ""
  );
}

function catalogServiceToken(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event);

  return String(runtimeConfig.commercialCatalogServiceToken || "");
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

async function ensureSession(event: H3Event) {
  const accessToken = getAccessToken(event);
  if (accessToken) {
    return true;
  }

  return Boolean(await exchangeRefreshToken(event));
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

export async function proxyCommercialCatalogJson<TResponse>(
  event: H3Event,
  path: string,
  options: CatalogProxyOptions = {}
): Promise<TResponse | Record<string, unknown>> {
  if (!(await ensureSession(event))) {
    setResponseStatus(event, 401, "Unauthorized");
    return unauthorizedProblem();
  }

  const url = `${catalogBaseUrl(event)}${path}`;
  const method = options.method ?? "GET";
  const body = options.body ?? (method === "GET" ? undefined : await readBody(event));
  const headers = new Headers({
    Accept: "application/json",
    "X-Service-Token": catalogServiceToken(event)
  });
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  forwardTracingHeaders(event, headers);

  const response = await fetch(url, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers,
    method
  });
  setUpstreamTraceHeaders(event, response);

  if (!response.ok) {
    setResponseStatus(event, response.status, response.statusText);
  }

  return await readUpstreamPayload(response);
}
