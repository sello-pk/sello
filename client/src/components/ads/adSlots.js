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
  contact: "VITE_ADSENSE_SLOT_CONTACT",
  about: "VITE_ADSENSE_SLOT_ABOUT",
};

const env = import.meta.env || {};

const readSlot = (key) => {
  const value = env[SLOT_ENV_KEYS[key]];
  return typeof value === "string" ? value.trim() : "";
};

/** Publisher id, e.g. "ca-pub-5923513384592431". Empty until configured. */
export const ADSENSE_CLIENT = (env.VITE_ADSENSE_CLIENT || "").trim();

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

export { SLOT_ENV_KEYS };
