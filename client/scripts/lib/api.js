import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CLIENT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export const SITE_URL = "https://sello.pk";

const HOME_DIR_ENV = path.join(CLIENT_ROOT, ".env");
const ENV_VARS = {};

if (fs.existsSync(HOME_DIR_ENV)) {
  for (const rawLine of fs.readFileSync(HOME_DIR_ENV, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) ENV_VARS[key] = value;
  }
}

export const API_BASE_URL = (
  process.env.VITE_API_URL ||
  ENV_VARS.VITE_API_URL ||
  "https://api.sello.pk/api"
).replace(/\/+$/, "");

export const SITE_CONFIG = {
  siteUrl: SITE_URL,
  apiBase: API_BASE_URL,
};

/**
 * Json-aware fetch with a hard timeout and a small number of retries.
 * The build fails loudly (instead of emitting empty pages) when the public
 * blog API is unreachable, unless SKIP_BLOG_PAGES=1 is set.
 */
export async function fetchJson(url, { timeoutMs = 90_000, retries = 4 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let status = 0;
    let retryAfterMs = 0;
    try {
      const res = await globalThis.fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      status = res.status;
      if (!res.ok) {
        const retryAfter = Number.parseInt(
          res.headers?.get("retry-after") || "",
          10,
        );
        if (Number.isFinite(retryAfter) && retryAfter > 0) {
          retryAfterMs = retryAfter * 1000;
        }
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return await res.json();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        let delayMs = 600 * (attempt + 1);
        if (status === 429) {
          delayMs = retryAfterMs || 3000 * (attempt + 1);
          process.stderr.write(
            `[fetchJson] HTTP 429, backing off ${delayMs}ms before retry ${attempt + 1}/${retries}\n`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

export function blogsFromPayload(payload) {
  const data = payload?.data || payload || {};
  return (
    data?.blogs || payload?.blogs || (Array.isArray(payload) ? payload : [])
  );
}

/** Published blog list used for route discovery + sitemap. */
export async function fetchAllPublishedBlogs() {
  const res = await fetchJson(`${API_BASE_URL}/blogs?page=1&limit=1000&status=published`);
  const blogs = blogsFromPayload(res);
  return { blogs, payload: res?.data || res };
}

/** Single article used to SSR the detail pages and their metadata. */
export async function fetchPublishedBlogBySlug(slug) {
  const res = await fetchJson(
    `${API_BASE_URL}/blogs/slug/${encodeURIComponent(slug)}`,
  );
  return res?.data || res || null;
}

/** Blog category list consumed by /blog and /blog/all. */
export async function fetchBlogCategories() {
  const res = await fetchJson(`${API_BASE_URL}/categories?type=blog&isActive=true`);
  return res?.data || res || [];
}

export function articlePlainText(blog) {
  const content = blog?.content || "";
  if (typeof content !== "string") return "";
  return content
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Matches the visible word gate used at render time. */
export function isSubstantialArticle(blog) {
  if (!blog || !blog.slug) return false;
  const words = articlePlainText(blog).split(/\s+/).filter(Boolean).length;
  if (words >= 100) return true;
  const excerpt = String(blog.excerpt || "").trim();
  return excerpt.length >= 80;
}