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

export const toTitleCase = (value) =>
  String(value || "")
    .trim()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));

// Curated SEO copy for city landing pages (footer "VIEW CARS BY CITY" links).
// Keyed by slugify(city). Falls back to the generic template below when a
// city is not listed here.
export const CITY_PAGE_COPY = {
  karachi: {
    title: "Cars for Sale in Karachi | Affordable Used Cars & Best Offers",
    description:
      "Find cars for sale in Karachi at competitive prices. Explore used cars, compare models, features, and prices to find the right car for your budget.",
  },
  lahore: {
    title: "Cars for Sale in Lahore | Buy New & Used Cars at Great Prices",
    description:
      "Browse cars for sale in Lahore and explore used and new models. Compare prices, features, and available options to find your ideal car.",
  },
  islamabad: {
    title: "Buy Cars in Islamabad | Used Cars for Sale & Best Deals",
    description:
      "Discover cars for sale in Islamabad at competitive prices. Browse used models, compare features, and find affordable options for your next car.",
  },
  rawalpindi: {
    title: "Cars for Sale in Rawalpindi | Find Used Cars at Affordable Prices",
    description:
      "Find your ideal car for sale in Rawalpindi. Explore used vehicles, compare prices and models, and discover affordable deals for your next car.",
  },
  peshawar: {
    title: "Find Cars for Sale in Peshawar | Used Cars & Affordable Deals",
    description:
      "Discover affordable cars for sale in Peshawar. Browse used vehicles, compare prices and features, and find great deals on your next car.",
  },
  faisalabad: {
    title: "Find Cars in Faisalabad | Used Models, Prices & Best Deals",
    description:
      "Looking for a used car in Faisalabad? Explore available models, compare prices and features, and find affordable vehicle options for your next purchase.",
  },
  multan: {
    title: "Cars for Sale Multan | Used Vehicles at Affordable Prices",
    description:
      "Browse cars for sale in Multan and explore a wide range of used vehicles. Compare prices, models, and features to find an affordable car for you.",
  },
  gujranwala: {
    title: "Cars for Sale Gujranwala | Used Vehicles at Best Prices",
    description:
      "Browse cars for sale in Gujranwala and explore a wide range of used vehicles. Compare prices, models, and features to find an affordable car for you.",
  },
  sialkot: {
    title: "Best Cars for Sale in Sialkot | Used Cars & Great Prices",
    description:
      "Discover the best cars for sale in Sialkot at competitive prices. Browse used vehicles, compare models and features, and find a suitable car today.",
  },
  sargodha: {
    title: "Best Cars for Sale in Sargodha | Used Vehicles at Best Prices",
    description:
      "Looking for a car in Sargodha? Browse used vehicles, compare popular models, prices, and features, and find an affordable option for your next purchase.",
  },
  hyderabad: {
    title: "Cars for Sale in Hyderabad | Find Used Cars & Great Prices",
    description:
      "Find used cars for sale in Hyderabad at attractive prices. Explore different models, compare features, and discover vehicle deals that suit your budget.",
  },
  abbottabad: {
    title: "Cars for Sale in Abbottabad | Affordable Models & Prices",
    description:
      "Browse affordable cars for sale in Abbottabad. Explore used models, compare vehicle prices and features, and find the right option for your budget.",
  },
  quetta: {
    title: "Used Cars for Sale in Quetta | Best Value Deals at Sello",
    description:
      "Explore used cars for sale in Quetta at affordable prices. Compare different models, features, and prices to find a vehicle that suits your budget.",
  },
  bahawalpur: {
    title: "Used Cars for Sale in Bahawalpur | Best Prices in Pakistan",
    description:
      "Discover the latest car deals in Bahawalpur and explore used cars at competitive prices. Compare different models and find a vehicle within your budget.",
  },
  mardan: {
    title: "Cars Deals in Mardan | Used Cars for Sale at Good Prices",
    description:
      "Discover car deals in Mardan and explore used vehicles at attractive prices. Compare models and find a suitable car that offers value for your money.",
  },
  "wah-cantt": {
    title: "Buy Used Cars in Wah Cantt | Best Prices & Car Deals",
    description:
      "Buy used cars in Wah Cantt at attractive prices. Explore popular models, compare available vehicles, and discover affordable deals for your next car.",
  },
  gujrat: {
    title: "Used Cars for Sale in Gujrat | Best Prices & Book a Test Drive",
    description:
      "Explore cars for sale in Gujrat and discover used vehicles at attractive prices. Compare popular models and find great offers for your next car.",
  },
  sahiwal: {
    title: "Buy Used Cars in Sahiwal | Best Prices & Attractive Car Deals",
    description:
      "Looking to buy a car in Sahiwal? Explore used vehicles, compare prices and models, and discover affordable deals for different budgets.",
  },
  mansehra: {
    title: "Used Cars in Mansehra | Find Your Ideal Car at Best Prices",
    description:
      "Explore used cars for sale in Mansehra with attractive prices and great deals. Compare models and find an affordable car that fits your budget.",
  },
  attock: {
    title: "Find Used Cars in Attock | Best Models & Affordable Prices",
    description:
      "Browse used cars in Attock and explore popular models, competitive prices, and attractive offers. Find an affordable vehicle that meets your requirements.",
  },
};

export const getListingsPageCopy = ({ city, make, model, searchTerm } = {}) => {
  if (city) {
    const citySlug = slugify(city);
    const curated = CITY_PAGE_COPY[citySlug];
    if (curated) {
      return { ...curated };
    }
    const cityName = toTitleCase(city);
    const title = `Used Cars for Sale in ${cityName} | Verified Listings — Sello.pk`;
    return {
      title,
      description: `Browse used cars for sale in ${cityName} on Sello. Compare prices, specs, and sellers before you buy.`,
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
  toTitleCase,
};
