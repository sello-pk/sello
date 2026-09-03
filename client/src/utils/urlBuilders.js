// Utility helpers for building user-facing, SEO-friendly URLs
// Centralizing this keeps URLs consistent across the app.

/**
 * Build a SEO-friendly car details URL (PakWheels style).
 *
 * Examples:
 * - "/cars/suzuki-wagon-2017-for-sale-in-lahore-<id>"
 * - Falls back to "/cars/<id>" if we can't generate a slug.
 */
export const buildCarUrl = (car) => {
  if (!car || !car._id) return "/cars";

  const make = car.make ? slugify(car.make) : "";
  const model = car.model ? slugify(car.model) : "";
  const year = car.year || "";
  const city = car.city || car.location || car.region || "";
  const citySlug = city ? slugify(city) : "";

  if (!make && !model && !year) {
    return `/cars/${car._id}`;
  }

  // PakWheels style: {make}-{model}-{year}-for-sale-in-{city}-{id}
  const slugParts = [make, model, year, "for-sale-in", citySlug].filter(Boolean);
  return `/cars/${slugParts.join("-")}-${car._id}`;
};

/**
 * Extract the underlying database ID from a slugged car URL segment.
 *
 * Accepts either:
 * - "<id>"
 * - "some-slug-text-<id>"
 */
export const extractCarIdFromSlug = (value) => {
  if (!value || typeof value !== "string") return "";
  const segments = value.split("-");
  return segments[segments.length - 1] || "";
};

/**
 * Build a stable blog post URL.
 *
 * Uses slug when available, falls back to ID to preserve old links.
 * Examples:
 * - "/blog/how-to-buy-a-used-car"
 * - "/blog/<id>"
 */
export const buildBlogUrl = (blog) => {
  if (!blog) return "/blog";
  if (blog.slug && typeof blog.slug === "string") {
    return `/blog/${blog.slug}`;
  }
  if (blog._id) {
    return `/blog/${blog._id}`;
  }
  return "/blog";
};

export const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const unslugify = (slug) =>
  String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

/**
 * City landings: /used-cars/lahore
 * Other filters stay on /search-results?...
 */
export const buildListingsSearchUrl = (filters = {}) => {
  const params = new URLSearchParams();
  let city = "";

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === "" || value == null) return;
    if (key === "city") {
      city = String(value);
      return;
    }
    params.set(key, String(value));
  });

  const qs = params.toString();
  if (city) {
    return `/used-cars/${slugify(city)}${qs ? `?${qs}` : ""}`;
  }
  return `/search-results${qs ? `?${qs}` : ""}`;
};

export const getListingsPageCopy = ({ city, make, model, searchTerm } = {}) => {
  if (city) {
    const title = `Cars for sale in ${city}`;
    return {
      title,
      description: `Browse used cars for sale in ${city} on Sello. Compare prices, specs, and sellers before you buy.`,
    };
  }
  if (make && model) {
    const title = `${make} ${model} for sale`;
    return {
      title,
      description: `Find ${make} ${model} listings for sale in Pakistan on Sello.`,
    };
  }
  if (make) {
    const title = `Used ${make} Cars`;
    return {
      title,
      description: `Browse used ${make} cars for sale in Pakistan on Sello.`,
    };
  }
  if (searchTerm) {
    return {
      title: `Search Results for "${searchTerm}"`,
      description: `Cars matching "${searchTerm}" on Sello.pk.`,
    };
  }
  return {
    title: "Search Results",
    description: "Browse filtered car listings on Sello.pk.",
  };
};

// Default export for backward compatibility
export default {
  buildCarUrl,
  extractCarIdFromSlug,
  buildBlogUrl,
  slugify,
  unslugify,
  buildListingsSearchUrl,
  getListingsPageCopy,
};
