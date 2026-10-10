import Car from "../models/carModel.js";
import Logger from "../utils/logger.js";

/** Matches client/src/utils/urlBuilders.js — keep listing links consistent with the SPA */
function buildCarPath(car) {
  if (!car?._id) return "/cars";
  const id = String(car._id);
  const slugify = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const make = slugify(car.make);
  const model = slugify(car.model);
  const year = car.year || "";
  const city = slugify(car.city || car.location || "");
  if (!make && !model && !year) return `/cars/${id}`;
  const slugParts = [make, model, year, "for-sale-in", city].filter(Boolean);
  return `/cars/${slugParts.join("-")}-${id}`;
}

function getPublicSiteOrigin() {
  const raw =
    process.env.META_CATALOG_SITE_URL ||
    process.env.PRODUCTION_URL ||
    (process.env.CLIENT_URL && process.env.CLIENT_URL.split(",")[0]?.trim()) ||
    "https://sello.pk";
  return raw.replace(/\/$/, "");
}

function absolutizeImage(url) {
  if (!url || typeof url !== "string") return "";
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  const origin = getPublicSiteOrigin();
  return `${origin}${u.startsWith("/") ? "" : "/"}${u}`;
}

function normalizeDescription(text) {
  if (text == null) return "";
  return String(text).replace(/\s+/g, " ").trim();
}

function escapeCsvField(val) {
  const s = val == null ? "" : String(val);
  return `"${s.replace(/"/g, '""')}"`;
}

function metaCondition(car) {
  const c = car.condition;
  if (c == null || c === "") return "used";
  return String(c).toLowerCase();
}

function metaAvailability(car) {
  return car.status === "active" ? "in stock" : "out of stock";
}

function metaLocation(car) {
  const city = car.city?.trim?.() || "";
  const loc = car.location?.trim?.() || "";
  if (city && loc) return `${city}, ${loc}`;
  return city || loc || "";
}

const CSV_COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
  "model",
  "year",
  "mileage",
  "body_style",
  "fuel_type",
  "transmission",
  "location",
];

let cacheBody = null;
let cacheExpiresAt = 0;

const CACHE_MS =
  parseInt(process.env.META_CATALOG_CACHE_SECONDS || "", 10) > 0
    ? parseInt(process.env.META_CATALOG_CACHE_SECONDS, 10) * 1000
    : 7 * 60 * 1000;

function buildBaseListingQuery() {
  const now = new Date();
  return {
    $and: [
      { $or: [{ isApproved: true }, { isApproved: { $exists: false } }] },
      { status: { $nin: ["deleted", "expired"] } },
      {
        $or: [
          { status: { $ne: "sold" } },
          {
            status: "sold",
            $or: [{ autoDeleteDate: { $gt: now } }, { autoDeleteDate: { $exists: false } }],
          },
        ],
      },
    ],
  };
}

/**
 * Meta Vehicle Catalog CSV feed.
 * Note: https://sello.pk/listings is the React listings page (HTML). Inventory JSON is served from GET /api/cars.
 * This handler reads the same public inventory from MongoDB (aligned with /api/cars visibility rules).
 */
export async function sendMetaCarsCsvFeed(req, res) {
  try {
    const now = Date.now();
    if (cacheBody && now < cacheExpiresAt) {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Cache-Control", `public, max-age=${Math.floor(CACHE_MS / 1000)}`);
      return res.send(cacheBody);
    }

    const origin = getPublicSiteOrigin();
    const query = buildBaseListingQuery();

    const cursor = Car.find(query)
      .select(
        "title description make model year price images city location status condition fuelType transmission mileage bodyType postedBy createdAt featured listingType",
      )
      .sort({ featured: -1, status: 1, createdAt: -1 })
      .lean()
      .cursor();

    const chunks = [];
    chunks.push(`${CSV_COLUMNS.join(",")}\n`);

    for await (const car of cursor) {
      const id = String(car._id);
      const priceNum = Number(car.price);
      const priceStr = Number.isFinite(priceNum) ? `${Math.round(priceNum)} PKR` : "";

      const row = [
        id,
        normalizeDescription(car.title),
        normalizeDescription(car.description),
        metaAvailability(car),
        metaCondition(car),
        priceStr,
        `${origin}${buildCarPath(car)}`,
        absolutizeImage(car.images?.[0]),
        car.make ?? "",
        car.model ?? "",
        car.year ?? "",
        car.mileage ?? "",
        car.bodyType ?? "",
        car.fuelType ?? "",
        car.transmission ?? "",
        metaLocation(car),
      ];

      chunks.push(`${row.map(escapeCsvField).join(",")}\n`);
    }

    const body = chunks.join("");
    cacheBody = body;
    cacheExpiresAt = Date.now() + CACHE_MS;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Cache-Control", `public, max-age=${Math.floor(CACHE_MS / 1000)}`);
    return res.send(body);
  } catch (error) {
    Logger.error("Meta catalog CSV feed failed", error);
    return res.status(500).send("feed_error");
  }
}

/* ------------------------------------------------------------------------ */
/* XML sitemap of live car listings                                          */
/* ------------------------------------------------------------------------ */

const SITEMAP_MAX_URLS = 50000; // sitemaps.org hard limit per file
let sitemapBody = null;
let sitemapExpiresAt = 0;
const SITEMAP_CACHE_MS = 60 * 60 * 1000; // 1 hour

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * GET /sitemap-cars.xml
 * Every public, unsold car detail page (same visibility rules as /api/cars),
 * with the same slug URLs the SPA uses as canonical. Referenced from
 * https://sello.pk/robots.txt (cross-host sitemap submission is allowed when
 * the sitemap is listed in the target site's robots.txt).
 */
export async function sendCarsSitemap(req, res) {
  try {
    const now = Date.now();
    if (!sitemapBody || now >= sitemapExpiresAt) {
      // Sitemap URLs must be on the canonical host that lists this sitemap in
      // its robots.txt, never on CLIENT_URL (which may include localhost).
      const origin = (process.env.SITEMAP_SITE_URL || "https://sello.pk").replace(/\/$/, "");
      const query = {
        $and: [
          { $or: [{ isApproved: true }, { isApproved: { $exists: false } }] },
          { status: { $nin: ["deleted", "expired", "sold"] } },
          { isSold: { $ne: true } },
        ],
      };

      const cursor = Car.find(query)
        .select("make model year city location updatedAt createdAt images")
        .sort({ updatedAt: -1 })
        .limit(SITEMAP_MAX_URLS)
        .lean()
        .cursor();

      const parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
      ];
      for await (const car of cursor) {
        const lastmod = new Date(car.updatedAt || car.createdAt || Date.now()).toISOString();
        const image = absolutizeImage(car.images?.[0]);
        parts.push(
          `  <url><loc>${escapeXml(`${origin}${buildCarPath(car)}`)}</loc><lastmod>${lastmod}</lastmod>${
            image ? `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>` : ""
          }</url>`,
        );
      }
      parts.push("</urlset>");
      sitemapBody = parts.join("\n");
      sitemapExpiresAt = Date.now() + SITEMAP_CACHE_MS;
    }

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(sitemapBody);
  } catch (error) {
    Logger.error("Cars sitemap failed", error);
    return res.status(500).type("text/plain").send("sitemap_error");
  }
}
