// pup-pantry/frontend/lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Read JWT from localStorage (client only)
export function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function pathNeedsAuthForGet(relPath) {
  // GET endpoints that DO require auth
  // (Public GETs like /ingredients, /brands, /products, /inventory don't need it)
  return /^\/(dogs|favorites|reviews|auth\/me)(\/|$)/i.test(relPath || "");
}

async function request(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined && options.body !== null;

  // Only set JSON content-type when sending a body
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Build absolute URL
  const base = (API_BASE || "").replace(/\/+$/, "");
  const rel = String(path || "").startsWith("/") ? path : `/${path || ""}`;
  const url = `${base}${rel}`;

  // Attach token:
  // - Always for non-GET (POST/PATCH/DELETE)
  // - For GET only when the endpoint actually needs auth
  const token = getToken();
  if (
    token &&
    !headers.has("Authorization") &&
    (method !== "GET" || pathNeedsAuthForGet(rel))
  ) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Prepare body
  let body = options.body;
  if (hasBody && typeof body === "object" && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  // Fire request
  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: hasBody ? body : undefined,
      credentials: "omit", // using Bearer tokens, not cookies
    });
  } catch (err) {
    const hint = API_BASE
      ? `Network error contacting ${API_BASE}.`
      : "Environment var NEXT_PUBLIC_API_BASE_URL is empty.";
    const e = new Error(`Failed to fetch. ${hint}`);
    e.cause = err;
    throw e;
  }

  const text = await res.text();
  const isJson =
    (res.headers.get("content-type") || "")
      .toLowerCase()
      .includes("application/json");
  const data = isJson ? (text ? JSON.parse(text) : null) : text;

  if (!res.ok) {
    const e = new Error(
      data?.error?.message || data?.message || `${res.status} ${res.statusText}`
    );
    e.status = res.status;
    e.data = data;
    throw e;
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
};

export default api;
