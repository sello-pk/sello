/**
 * Canonical car detail paths — keep in sync with
 * client/src/utils/urlBuilders.js buildCarUrl.
 */

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildCarPath(car) {
  if (!car?._id) return "/cars";
  const id = String(car._id);
  const make = slugify(car.make);
  const model = slugify(car.model);
  const year = car.year || "";
  const city = slugify(car.city || car.location || "");
  if (!make && !model && !year) return `/cars/${id}`;
  const slugParts = [make, model, year, "for-sale-in", city].filter(Boolean);
  return `/cars/${slugParts.join("-")}-${id}`;
}

export function extractCarIdFromSlug(value) {
  if (!value || typeof value !== "string") return "";
  const segments = value.split("-");
  return segments[segments.length - 1] || "";
}

export function getPublicSiteOrigin() {
  const raw =
    process.env.SITEMAP_SITE_URL ||
    process.env.META_CATALOG_SITE_URL ||
    process.env.PRODUCTION_URL ||
    (process.env.CLIENT_URL && process.env.CLIENT_URL.split(",")[0]?.trim()) ||
    "https://sello.pk";
  return String(raw).replace(/\/$/, "");
}

export function buildCarAbsoluteUrl(car) {
  return `${getPublicSiteOrigin()}${buildCarPath(car)}`;
}
