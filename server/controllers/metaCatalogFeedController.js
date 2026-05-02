import Car from "../models/carModel.js";
import Logger from "../utils/logger.js";

/** Matches client/src/utils/urlBuilders.js — keep listing links consistent with the SPA */
function buildCarPath(car) {
  if (!car?._id) return "/cars";
  const id = String(car._id);
  const parts = [car.year, car.make, car.model, car.city || car.location]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!parts) return `/cars/${id}`;
  return `/cars/${parts}-${id}`;
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
