/**
 * Build-time SEO shells for money pages that stay SPA at runtime.
 *
 * Writes static HTML with crawlable <title>, meta, canonical, Product/Collection
 * JSON-LD, and a noscript content block — without React SSR (avoids hydration risk).
 *
 * Covered: car detail pages, city landings, listing hubs.
 * Blog/about/contact continue to use render-static-html.js (full prerender).
 *
 * SKIP_SEO_SHELLS=1  — skip entirely (never fails the build)
 * SELLO_VERBOSE=1    — log each written path
 */

import fs from "node:fs";
import path from "node:path";
import {
  CLIENT_ROOT,
  API_BASE_URL,
  SITE_URL,
  fetchJson,
} from "./lib/api.js";
import {
  applyPageHead,
  escapeHtml,
  injectNoscriptBlock,
  injectScript,
  safeJson,
  stripHeroPreloads,
  toAbsolute,
} from "./lib/htmlHead.js";

const DIST_ROOT = path.join(CLIENT_ROOT, "dist");
const SKIP = process.env.SKIP_SEO_SHELLS === "1";
const VERBOSE = process.env.SELLO_VERBOSE === "1";
const CONCURRENCY = Math.max(1, Number(process.env.SELLO_CONCURRENCY || 6));

function log(...args) {
  console.log(`[seo-shells] ${new Date().toISOString().slice(11, 19)}`, ...args);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildCarPath(car) {
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

function toTitleCase(value) {
  return String(value || "")
    .trim()
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function carTitle(car) {
  if (car.title) return String(car.title).trim();
  const parts = [car.year, car.make, car.model].filter(Boolean);
  parts.push("for sale");
  if (car.city) parts.push("in", car.city);
  return parts.join(" ");
}

function carDescription(car) {
  if (car.description && String(car.description).trim().length > 40) {
    return String(car.description).replace(/\s+/g, " ").trim().slice(0, 300);
  }
  const price =
    car.price != null ? `PKR ${Number(car.price).toLocaleString()}` : "";
  const parts = [carTitle(car)];
  if (price) parts.push(price);
  if (car.mileage != null) {
    parts.push(`${Number(car.mileage).toLocaleString()} KM`);
  }
  if (car.transmission) parts.push(String(car.transmission));
  if (car.fuelType) parts.push(String(car.fuelType));
  return `${parts.join(" · ")}. Buy or contact the seller on Sello.pk.`.slice(
    0,
    320,
  );
}

function vehicleJsonLd(car, canonical) {
  const availability =
    car.isSold || car.status === "sold"
      ? "https://schema.org/SoldOut"
      : "https://schema.org/InStock";
  const itemCondition =
    car.condition === "New"
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition";
  const images = (car.images || [])
    .map((img) => toAbsolute(SITE_URL, img))
    .filter(Boolean);

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: carTitle(car),
    description: carDescription(car),
    image: images.length ? images : undefined,
    sku: String(car._id),
    brand: { "@type": "Brand", name: car.make || "Unknown" },
    category: car.bodyType || car.vehicleType || "Car",
    itemCondition,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: car.price,
      availability,
      url: canonical,
      seller: { "@type": "Organization", name: "Sello.pk" },
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Listings",
        item: `${SITE_URL}/listings`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: carTitle(car),
        item: canonical,
      },
    ],
  };

  return { "@graph": [product, breadcrumb] };
}

function outputPathFor(routePath) {
  const clean = routePath.replace(/^\/+|\/+$/g, "");
  return path.join(DIST_ROOT, clean, "index.html");
}

function writeShell(routePath, transform, { keepHeroPreloads = false } = {}) {
  const shellPath = path.join(DIST_ROOT, "index.html");
  if (!fs.existsSync(shellPath)) {
    throw new Error("dist/index.html missing — run vite build first");
  }
  let html = fs.readFileSync(shellPath, "utf8");
  // Non-home shells must not inherit homepage LCP preloads (wastes bandwidth).
  if (!keepHeroPreloads) html = stripHeroPreloads(html);
  html = transform(html);
  const outPath = outputPathFor(routePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, "utf8");
  if (VERBOSE) log(`OK ${routePath}`);
  return outPath;
}

async function fetchAllPublicCars() {
  const cars = [];
  let page = 1;
  let pages = 1;
  const limit = 100;
  while (page <= pages && page <= 500) {
    const res = await fetchJson(
      `${API_BASE_URL}/cars?page=${page}&limit=${limit}&includeSold=false`,
    );
    const data = res?.data || {};
    const batch = data.cars || [];
    pages = data.pages || 1;
    for (const car of batch) {
      if (!car?._id) continue;
      if (car.isSold || car.status === "sold" || car.status === "deleted") continue;
      cars.push(car);
    }
    if (!batch.length) break;
    page += 1;
  }
  return cars;
}

async function mapLimit(items, limit, worker) {
  const results = [];
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = items[index++];
      try {
        results.push({ ok: true, value: await worker(current) });
      } catch (error) {
        results.push({ ok: false, error, item: current });
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length || 1) }, () => run()),
  );
  return results;
}

const LISTING_HUBS = [
  {
    path: "/listings",
    title: "Buy and Sell Cars in Pakistan | Trusted Brands – Sello.pk",
    description:
      "Buy and sell cars in Pakistan with confidence. Explore premium brands, compare models, and connect with trusted sellers on Sello.pk.",
  },
  {
    path: "/listings/cars",
    title: "Cars for Sale in Pakistan | Used & New Cars - Sello.pk",
    description:
      "Find cars for sale in Pakistan with prices, specifications, and seller contact details on Sello.pk.",
  },
  {
    path: "/listings/bikes",
    title: "Bikes for Sale in Pakistan | Sello.pk",
    description:
      "Browse motorcycles and bikes for sale in Pakistan. Compare prices and contact sellers on Sello.pk.",
  },
  {
    path: "/listings/trucks",
    title: "Trucks for Sale in Pakistan | Sello.pk",
    description:
      "Find trucks for sale in Pakistan with listing details, prices, and seller information on Sello.pk.",
  },
  {
    path: "/view-all-brands",
    title: "Car Brands in Pakistan | Browse by Make - Sello.pk",
    description:
      "Explore car brands available on Sello.pk and jump to make and model listings across Pakistan.",
  },
  {
    path: "/car-estimator",
    title: "AI Car Estimator - Find Your Car's Real Value | Sello.pk",
    description:
      "Get instant AI-powered car valuations for Pakistani market. Estimate your car's price based on make, model, year, condition, and location.",
  },
  {
    path: "/auctions",
    title: "Bid & Win Deals – Live Car Auctions | Sello.pk",
    description:
      "Join Sello.pk live car auctions. Browse upcoming lots, learn how bidding works, and win vehicles at competitive prices in Pakistan.",
  },
  {
    path: "/auctions/live",
    title: "Live Car Auction | Bid Now on Sello.pk",
    description:
      "Watch and bid on live vehicle auctions on Sello.pk. Real-time bidding for cars across Pakistan.",
  },
  {
    path: "/auctions/schedule",
    title: "Auction Schedule | Upcoming Car Auctions - Sello.pk",
    description:
      "See upcoming Sello.pk car auction dates and lots. Plan your bids and inspect vehicles before the live sale.",
  },
  {
    path: "/help-center",
    title: "Help Center | Sello.pk Support",
    description:
      "Get help buying or selling cars on Sello.pk. Find answers about listings, auctions, payments, and account support.",
  },
  {
    path: "/help/faqs",
    title: "FAQs | Buy & Sell Cars on Sello.pk",
    description:
      "Frequently asked questions about buying, selling, and auctioning cars on Sello.pk in Pakistan.",
  },
];

const CITY_SLUGS = [
  "karachi",
  "lahore",
  "islamabad",
  "rawalpindi",
  "peshawar",
  "faisalabad",
  "multan",
  "gujranwala",
  "sialkot",
  "sargodha",
  "hyderabad",
  "abbottabad",
  "quetta",
  "bahawalpur",
  "mardan",
  "wah-cantt",
  "gujrat",
  "sahiwal",
  "mansehra",
  "attock",
];

function writeLandingShell({ path: routePath, title, description, noscriptExtra = "" }) {
  const canonical = `${SITE_URL}${routePath}`;
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: "Sello.pk", url: SITE_URL },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: title, item: canonical },
    ],
  };

  writeShell(routePath, (html) => {
    let out = applyPageHead(html, { title, description, canonical });
    out = injectScript(
      out,
      "application/ld+json",
      "structured-data",
      safeJson({ "@graph": [collection, breadcrumb] }),
    );
    out = injectNoscriptBlock(
      out,
      `      <article>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        <p><a href="${SITE_URL}/listings">Browse all listings</a> · <a href="${SITE_URL}/blog">Car blog</a></p>
        ${noscriptExtra}
      </article>`,
    );
    return out.replace(
      "</body>",
      `<!-- seo-shell:${routePath} -->\n  </body>`,
    );
  });
}

function writeCarShell(car) {
  const routePath = buildCarPath(car);
  const canonical = `${SITE_URL}${routePath}`;
  const title = `${carTitle(car)} | Sello.pk`;
  const description = carDescription(car);
  const image = toAbsolute(SITE_URL, car.images?.[0]);
  const price =
    car.price != null ? `PKR ${Number(car.price).toLocaleString()}` : "";

  writeShell(routePath, (html) => {
    let out = applyPageHead(html, {
      title,
      description,
      canonical,
      image,
    });
    out = injectScript(
      out,
      "application/ld+json",
      "structured-data",
      safeJson(vehicleJsonLd(car, canonical)),
    );
    out = injectNoscriptBlock(
      out,
      `      <article>
        <h1>${escapeHtml(carTitle(car))}</h1>
        ${price ? `<p><strong>Price:</strong> ${escapeHtml(price)}</p>` : ""}
        ${car.city ? `<p><strong>Location:</strong> ${escapeHtml(car.city)}</p>` : ""}
        ${car.year ? `<p><strong>Year:</strong> ${escapeHtml(car.year)}</p>` : ""}
        ${car.mileage != null ? `<p><strong>Mileage:</strong> ${escapeHtml(Number(car.mileage).toLocaleString())} KM</p>` : ""}
        ${car.condition ? `<p><strong>Condition:</strong> ${escapeHtml(car.condition)}</p>` : ""}
        <p>${escapeHtml(description)}</p>
        ${image ? `<p><img src="${escapeHtml(image)}" alt="${escapeHtml(carTitle(car))}" width="800" height="600" /></p>` : ""}
        <p><a href="${SITE_URL}/listings">More cars for sale</a> · <a href="${SITE_URL}/contact">Contact Sello</a></p>
      </article>`,
    );
    return out.replace(
      "</body>",
      `<!-- seo-shell:${routePath} -->\n  </body>`,
    );
  });
}

/** Auth / account paths: first HTML must be noindex (SPA meta alone is too late). */
const NOINDEX_SHELLS = [
  {
    path: "/login",
    title: "Login | Sello.pk",
    description: "Sign in to your Sello.pk account.",
  },
  {
    path: "/sign-up",
    title: "Sign Up | Sello.pk",
    description: "Create a Sello.pk account to buy or sell cars.",
  },
  {
    path: "/forgot-password",
    title: "Forgot Password | Sello.pk",
    description: "Reset your Sello.pk account password.",
  },
  {
    path: "/reset-password",
    title: "Reset Password | Sello.pk",
    description: "Choose a new password for your Sello.pk account.",
  },
  {
    path: "/reset-success",
    title: "Password Updated | Sello.pk",
    description: "Your Sello.pk password was updated.",
  },
  {
    path: "/verify-otp",
    title: "Verify OTP | Sello.pk",
    description: "Verify your Sello.pk account with a one-time code.",
  },
  {
    path: "/profile",
    title: "My Profile | Sello.pk",
    description: "Manage your Sello.pk profile.",
  },
  {
    path: "/my-listings",
    title: "My Listings | Sello.pk",
    description: "Manage your vehicle listings on Sello.pk.",
  },
  {
    path: "/saved-cars",
    title: "Saved Cars | Sello.pk",
    description: "View cars you saved on Sello.pk.",
  },
  {
    path: "/my-chats",
    title: "My Chats | Sello.pk",
    description: "Your Sello.pk conversations.",
  },
  {
    path: "/create-post",
    title: "Create Listing | Sello.pk",
    description: "Create a vehicle listing on Sello.pk.",
  },
  {
    path: "/dealer/dashboard",
    title: "Dealer Dashboard | Sello.pk",
    description: "Dealer tools on Sello.pk.",
  },
];

function writeNoindexShell({ path: routePath, title, description }) {
  const canonical = `${SITE_URL}${routePath}`;
  writeShell(routePath, (html) => {
    let out = applyPageHead(html, {
      title,
      description,
      canonical,
      robots: "noindex, follow",
    });
    out = injectNoscriptBlock(
      out,
      `      <p>${escapeHtml(title)}</p>
      <p><a href="${SITE_URL}/">Back to Sello.pk</a></p>`,
    );
    return out.replace(
      "</body>",
      `<!-- seo-shell-noindex:${routePath} -->\n  </body>`,
    );
  });
}

function writeHomeShell() {
  const title = "Car for Sale in Pakistan | Buy & Sell Used Cars – Sello.pk";
  const description =
    "Find the best car for sale in Pakistan on Sello.pk. Buy or sell used cars in Karachi, Lahore, Islamabad & beyond with verified sellers and fair pricing.";
  const canonical = `${SITE_URL}/`;
  // Patch dist/index.html in place (path "/" → dist/index.html).
  // keepHeroPreloads: homepage owns the LCP image preloads from render-static.
  writeShell(
    "/",
    (html) => {
      let out = applyPageHead(html, { title, description, canonical });
      out = injectNoscriptBlock(
        out,
        `      <h1>Buy and Sell Cars in Pakistan</h1>
      <p>${escapeHtml(description)}</p>
      <p><a href="${SITE_URL}/listings">Browse listings</a> · <a href="${SITE_URL}/used-cars/karachi">Used cars in Karachi</a> · <a href="${SITE_URL}/blog">Blog</a></p>`,
      );
      return out.replace("</body>", `<!-- seo-shell:/ -->\n  </body>`);
    },
    { keepHeroPreloads: true },
  );
}

function writeNotFoundPage() {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, follow" />
  <title>Page not found | Sello.pk</title>
  <link rel="canonical" href="${SITE_URL}/" />
  <meta name="description" content="This page is not available on Sello.pk." />
</head>
<body>
  <main>
    <h1>Page not found</h1>
    <p>The page you requested does not exist.</p>
    <p><a href="${SITE_URL}/listings">Browse cars for sale</a> · <a href="${SITE_URL}/">Home</a></p>
  </main>
</body>
</html>`;
  fs.writeFileSync(path.join(DIST_ROOT, "404.html"), html, "utf8");
}

async function main() {
  if (SKIP) {
    log("SKIP_SEO_SHELLS=1 — skipping");
    return;
  }
  if (!fs.existsSync(path.join(DIST_ROOT, "index.html"))) {
    log("dist/index.html missing — skip (run after vite build)");
    return;
  }

  log(`api: ${API_BASE_URL}`);

  // Listing hubs + cities — local data only, always safe
  for (const hub of LISTING_HUBS) {
    writeLandingShell(hub);
  }
  for (const citySlug of CITY_SLUGS) {
    const cityName = toTitleCase(citySlug.replace(/-/g, " "));
    writeLandingShell({
      path: `/used-cars/${citySlug}`,
      title: `Used Cars for Sale in ${cityName} | Sello.pk`,
      description: `Browse used cars for sale in ${cityName}. Compare prices, photos, and seller details on Sello.pk.`,
      noscriptExtra: `<p><a href="${SITE_URL}/used-cars/${citySlug}">View ${escapeHtml(cityName)} inventory</a></p>`,
    });
  }
  log(`wrote ${LISTING_HUBS.length} hubs + ${CITY_SLUGS.length} city shells`);

  // Cars — best-effort; never fail the production build if API is flaky
  try {
    log("fetching public cars for detail shells…");
    const cars = await fetchAllPublicCars();
    log(`public cars: ${cars.length}`);
    const results = await mapLimit(cars, CONCURRENCY, async (car) => {
      writeCarShell(car);
      return car._id;
    });
    const errors = results.filter((r) => !r.ok);
    if (errors.length) {
      for (const e of errors.slice(0, 5)) {
        console.warn(
          `[seo-shells] car shell failed: ${e.error?.message || e.error}`,
        );
      }
    }
    log(
      `✓ car shells: ${results.length - errors.length} ok, ${errors.length} errors`,
    );
  } catch (error) {
    console.warn(
      `[seo-shells] WARN: car shells skipped (${error.message}). Hubs/cities still written.`,
    );
  }

  // After car shells (they copy index.html): homepage + private noindex + 404.
  writeHomeShell();
  for (const shell of NOINDEX_SHELLS) {
    writeNoindexShell(shell);
  }
  writeNotFoundPage();
  log(
    `✓ home + ${NOINDEX_SHELLS.length} noindex shells + 404.html`,
  );
}

main().catch((error) => {
  console.warn(`[seo-shells] WARN: ${error.message}`);
  process.exit(0);
});
