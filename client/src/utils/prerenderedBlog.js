const PRERENDER_KEY = "sello-prerendered-blog";

let cache = null;

/**
 * The static renderer embeds the full public article JSON in the initial
 * HTML (script#sello-prerendered-blog). SPA navigation between articles won't
 * find it (cache-less), but a fresh page load will. This lets the client paint
 * article content instantly and stay resilient when the API is briefly
 * unreachable, while still preferring fresh API data when it arrives.
 */
export function getPrerenderedBlog(routeId) {
  if (!routeId) return null;
  const payload = readPayload();
  if (!payload || !payload.blog) return null;
  const expected = String(routeId || "");
  const matchesSlug = payload.slug && expected === String(payload.slug);
  const matchesId =
    payload.blog && payload.blog._id && expected === String(payload.blog._id);
  return matchesSlug || matchesId ? payload.blog : null;
}

function readPayload() {
  if (cache !== null) return cache;
  try {
    if (typeof window === "undefined" || typeof document === "undefined") {
      cache = null;
      return null;
    }
    const el = document.getElementById(PRERENDER_KEY);
    if (!el) return null;
    const parsed = JSON.parse(el.textContent || "");
    cache =
      parsed && parsed.blog && parsed.blog.title ? parsed : null;
    return cache;
  } catch {
    cache = null;
    return null;
  }
}