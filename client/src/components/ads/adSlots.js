/**
 * Central AdSense slot registry.
 *
 * Every ad location in the app is declared here exactly once, so slots can be
 * enabled/disabled from a single place and each location keeps its own AdSense
 * ad unit id (which is what lets AdSense report revenue per placement).
 *
 * Ids live in env vars (`client/.env`) rather than in code:
 *   VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *   VITE_ADSENSE_SLOT_HOMEPAGE_TOP=1234567890
 *   ...
 *
 * A slot with no env value is treated as "not configured yet" and renders
 * nothing, so the site never pushes an empty/invalid ad unit to Google.
 *
 * Policy-safe mode (default ON until AdSense approves the site):
 *   Only content-rich placements render. Utility/tool screens, live-auction
 *   UI, and the global footer unit stay off so reviewers don't see ad-heavy /
 *   low-content screens. After approval set:
 *     VITE_ADSENSE_POLICY_SAFE=false
 */

const SLOT_ENV_KEYS = {
  // Global, sits above the footer on every public page.
  globalFooter: "VITE_ADSENSE_SLOT_GLOBAL_FOOTER",
  // Homepage: below the hero-adjacent content, and further down the feed.
  homepageTop: "VITE_ADSENSE_SLOT_HOMEPAGE_TOP",
  homepageFeed: "VITE_ADSENSE_SLOT_HOMEPAGE_FEED",
  // Homepage brands block: square unit beside the brand grid, not the marquee.
  brandsSection: "VITE_ADSENSE_SLOT_BRANDS_SECTION",
  // Listings: between the vehicle grid and the pagination controls.
  listingFeed: "VITE_ADSENSE_SLOT_LISTING_FEED",
  // Car detail: mid page, and again before the similar-vehicles block.
  carDetail: "VITE_ADSENSE_SLOT_CAR_DETAIL",
  carDetailBottom: "VITE_ADSENSE_SLOT_CAR_DETAIL_BOTTOM",
  // Editorial.
  blogIndex: "VITE_ADSENSE_SLOT_BLOG_INDEX",
  blogArticle: "VITE_ADSENSE_SLOT_BLOG_ARTICLE",
  // Auctions.
  auctionsIndex: "VITE_ADSENSE_SLOT_AUCTIONS_INDEX",
  auctionLive: "VITE_ADSENSE_SLOT_AUCTION_LIVE",
  // Feature pages.
  estimator: "VITE_ADSENSE_SLOT_ESTIMATOR",
  vehicleVerification: "VITE_ADSENSE_SLOT_VEHICLE_VERIFICATION",
  // /vehicle-verification horizontal banners. Paste each numeric ad unit id
  // into DEFAULT_SLOT_IDS below (AdSense > Ads > By ad unit).
  vehicleVerificationTop: "VITE_ADSENSE_SLOT_VEHICLE_VERIFICATION_TOP",
  vehicleVerificationBottom: "VITE_ADSENSE_SLOT_VEHICLE_VERIFICATION_BOTTOM",
  contact: "VITE_ADSENSE_SLOT_CONTACT",
  about: "VITE_ADSENSE_SLOT_ABOUT",
};

const env = import.meta.env || {};

/**
 * Default ON. Keeps AdSense review inventory limited to pages with real
 * publisher content. Flip to false only after the site is approved.
 */
export const ADSENSE_POLICY_SAFE =
  String(env.VITE_ADSENSE_POLICY_SAFE ?? "true").toLowerCase() !== "false";

/**
 * Slots allowed while ADSENSE_POLICY_SAFE is true.
 * Excludes: thin/utility screens (estimator), contact, live auction UI,
 * secondary detail units, and the every-page footer unit.
 *
 * `homepageTop` and the two vehicle-verification banners are included on
 * purpose: they sit between real content blocks (homepage feed sections,
 * long-form verification copy) rather than inside a bare tool screen.
 */
const POLICY_SAFE_SLOTS = new Set([
  "homepageTop",
  "homepageFeed",
  "brandsSection",
  "listingFeed",
  "carDetail",
  "blogIndex",
  "blogArticle",
  "auctionsIndex",
  "about",
  "vehicleVerificationTop",
  "vehicleVerificationBottom",
]);

/**
 * Public, non-secret ids used when the build has no client/.env (the file is
 * gitignored, so CI/server builds often lack it). Env values always win.
 *
 * Until dedicated units exist per placement, reuse the account's real ad unit
 * ids so policy-safe pages still request ads (empty DEFAULT_SLOT_IDS + safe
 * mode previously rendered zero units).
 */
const DEFAULT_ADSENSE_CLIENT = "ca-pub-9074113020959790";
const UNIT_SQUARE = "8356018574";
const UNIT_BANNER_A = "3793170615";
const UNIT_BANNER_B = "4559632387";
const DEFAULT_SLOT_IDS = {
  brandsSection: UNIT_SQUARE,
  homepageTop: UNIT_BANNER_B,
  homepageFeed: UNIT_BANNER_A,
  listingFeed: UNIT_BANNER_A,
  carDetail: UNIT_BANNER_B,
  blogIndex: UNIT_BANNER_A,
  blogArticle: UNIT_BANNER_B,
  auctionsIndex: UNIT_BANNER_A,
  about: UNIT_BANNER_B,
  // Banners between the long-form verification copy.
  vehicleVerificationTop: UNIT_BANNER_A,
  vehicleVerificationBottom: UNIT_BANNER_B,
};

const readSlot = (key) => {
  if (ADSENSE_POLICY_SAFE && !POLICY_SAFE_SLOTS.has(key)) return "";
  const value = env[SLOT_ENV_KEYS[key]];
  const fromEnv = typeof value === "string" ? value.trim() : "";
  return fromEnv || DEFAULT_SLOT_IDS[key] || "";
};

/** Publisher id, e.g. "ca-pub-9074113020959790". */
export const ADSENSE_CLIENT =
  (env.VITE_ADSENSE_CLIENT || "").trim() || DEFAULT_ADSENSE_CLIENT;

/**
 * Resolved slot ids keyed by name. Only slots with a real id are "enabled";
 * `AdSenseSlot` no-ops for the rest.
 */
export const AD_SLOTS = Object.keys(SLOT_ENV_KEYS).reduce((acc, key) => {
  acc[key] = readSlot(key);
  return acc;
}, {});

/** True when the publisher id and at least one slot id are configured. */
export const isAdSenseConfigured = () =>
  Boolean(ADSENSE_CLIENT) &&
  Object.values(AD_SLOTS).some((id) => Boolean(id));

export { SLOT_ENV_KEYS, POLICY_SAFE_SLOTS };
