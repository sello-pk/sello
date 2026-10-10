/**
 * Central indexing + ad-eligibility policy.
 *
 * One list decides which routes are private / utility pages. Those pages get
 * `noindex, follow` (SEO.jsx) and never render Google ads (AdSenseSlot.jsx),
 * which is what AdSense policy requires for login screens, dashboards,
 * payment flows, error pages and other screens without publisher content.
 *
 * Keep in sync with client/public/robots.txt.
 */

export const DEFAULT_ROBOTS = "index, follow, max-image-preview:large";
export const NOINDEX_ROBOTS = "noindex, follow";

/** Path prefixes (or exact paths) that must never be indexed or show ads. */
const PRIVATE_PATH_PATTERNS = [
  /^\/admin(\/|$)/,
  // Auth
  /^\/login\/?$/,
  /^\/sign-up\/?$/,
  /^\/forgot-password\/?$/,
  /^\/reset-password\/?$/,
  /^\/reset-success\/?$/,
  /^\/verify-otp\/?$/,
  /^\/accept-invite(\/|$)/,
  // Account & dashboards
  /^\/profile\/?$/,
  /^\/my-listings\/?$/,
  /^\/saved-cars\/?$/,
  /^\/my-chats\/?$/,
  /^\/create-post\/?$/,
  /^\/edit-car(\/|$)/,
  /^\/edit-auction-car(\/|$)/,
  /^\/dealer\/dashboard\/?$/,
  /^\/seller(\/|$)/,
  // Auction account / payment pages
  /^\/auctions\/(token-payment|transactions|watchlist|buyer-dashboard|seller-dashboard|wallet|result)\/?$/,
];

/**
 * Query parameters that represent indexable landing pages. Anything else in
 * the query string is dropped from the canonical URL.
 */
export const CANONICAL_PARAM_WHITELIST = ["make", "model", "city", "page"];

/** True for private / utility routes (never indexed, never show ads). */
export const isPrivatePath = (pathname = "") =>
  PRIVATE_PATH_PATTERNS.some((re) => re.test(pathname || ""));

/** Free-text internal search results: crawlable for links, not indexable. */
export const isInternalSearch = (pathname = "", search = "") => {
  const params = new URLSearchParams(search || "");
  if (params.get("search")) return true;
  // Bare /search-results with no landing params is an empty results page.
  if (/^\/search-results\/?$/.test(pathname)) {
    return !CANONICAL_PARAM_WHITELIST.some((k) => k !== "page" && params.get(k));
  }
  // Parameterised filter tool URLs duplicate the /search-results landings.
  if (/^\/filter\/?$/.test(pathname)) return [...params.keys()].length > 0;
  return false;
};

/** Robots value for a route when the page did not set one explicitly. */
export const getRobotsForPath = (pathname = "", search = "") =>
  isPrivatePath(pathname) || isInternalSearch(pathname, search)
    ? NOINDEX_ROBOTS
    : DEFAULT_ROBOTS;

export const isNoindexRobots = (value = "") => /\bnoindex\b/i.test(value || "");

/**
 * Keep only whitelisted query params (stable order) for canonical URLs, so
 * sort/view/tracking/session params never create duplicate canonicals.
 */
export const cleanCanonicalSearch = (search = "") => {
  if (!search) return "";
  const params = new URLSearchParams(search);
  const out = new URLSearchParams();
  for (const key of CANONICAL_PARAM_WHITELIST) {
    const value = params.get(key);
    if (!value || !String(value).trim()) continue;
    if (key === "page" && String(value).trim() === "1") continue;
    out.set(key, String(value).trim());
  }
  const qs = out.toString();
  return qs ? `?${qs}` : "";
};

/* ------------------------------------------------------------------ ads gate
 * Pages that render <SEO robots="noindex..."> (404, "car not found", private
 * pages) register here so the global ad slot hides while they are mounted.
 */
let noAdsCount = 0;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

export const blockAdsForPage = () => {
  noAdsCount += 1;
  emit();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    noAdsCount = Math.max(0, noAdsCount - 1);
    emit();
  };
};

export const subscribeAdsBlock = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getAdsBlocked = () => noAdsCount > 0;
