/**
 * IndexNow — notify Bing (and other IndexNow engines) when public URLs change.
 * Docs: https://www.indexnow.org/documentation
 *
 * Env:
 *   INDEXNOW_KEY          hex key (8–128 chars). Default is set for Sello.
 *   INDEXNOW_ENABLED      "false" to disable submissions
 *   INDEXNOW_SITE_URL     canonical origin (default https://sello.pk)
 */

import Logger from "./logger.js";
import { buildCarAbsoluteUrl, getPublicSiteOrigin } from "./carUrls.js";

export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY || "e20510d020aa752081a5b5691c75e110";

const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
];

const recent = new Map();
const DEDUPE_MS = 5 * 60 * 1000;
const MAX_BATCH = 100;

function isEnabled() {
  return process.env.INDEXNOW_ENABLED !== "false";
}

function siteHost() {
  try {
    return new URL(getPublicSiteOrigin()).host;
  } catch {
    return "sello.pk";
  }
}

function keyLocation() {
  return `${getPublicSiteOrigin()}/${INDEXNOW_KEY}.txt`;
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    // Never notify private / session surfaces
    const blocked = [
      "/admin",
      "/login",
      "/sign-up",
      "/profile",
      "/my-",
      "/create-post",
      "/edit-car",
      "/dealer/",
      "/seller/",
      "/api/",
    ];
    if (blocked.some((p) => u.pathname.startsWith(p))) return null;
    return u.toString().replace(/\/$/, u.pathname === "/" ? "/" : "");
  } catch {
    return null;
  }
}

async function postBatch(urls) {
  const unique = [...new Set(urls.map(normalizeUrl).filter(Boolean))];
  if (!unique.length) return { ok: true, skipped: true };

  const now = Date.now();
  const fresh = unique.filter((u) => {
    const last = recent.get(u) || 0;
    if (now - last < DEDUPE_MS) return false;
    recent.set(u, now);
    return true;
  });
  if (!fresh.length) return { ok: true, deduped: true };

  // Cap map size
  if (recent.size > 5000) {
    for (const [k, t] of recent) {
      if (now - t > DEDUPE_MS) recent.delete(k);
    }
  }

  const body = {
    host: siteHost(),
    key: INDEXNOW_KEY,
    keyLocation: keyLocation(),
    urlList: fresh.slice(0, MAX_BATCH),
  };

  let lastError;
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
      });
      // 200 / 202 accepted; 422 invalid; treat 2xx as success
      if (res.status >= 200 && res.status < 300) {
        Logger.info("IndexNow submitted", {
          count: body.urlList.length,
          status: res.status,
          endpoint,
        });
        return { ok: true, status: res.status };
      }
      lastError = new Error(`IndexNow HTTP ${res.status} from ${endpoint}`);
    } catch (error) {
      lastError = error;
    }
  }
  Logger.warn("IndexNow submit failed", {
    message: lastError?.message,
    count: body.urlList.length,
  });
  return { ok: false, error: lastError?.message };
}

/**
 * Fire-and-forget URL notification. Never throws into request handlers.
 */
export function notifyIndexNow(urls) {
  if (!isEnabled()) return;
  const list = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
  if (!list.length) return;
  setImmediate(() => {
    postBatch(list).catch((err) =>
      Logger.warn("IndexNow unexpected error", { message: err?.message }),
    );
  });
}

/** Notify for a car document when it is publicly indexable (or was removed). */
export function notifyIndexNowForCar(car, { removed = false } = {}) {
  if (!car?._id) return;
  const url = buildCarAbsoluteUrl(car);
  // Always notify on remove/sold so engines drop stale URLs.
  if (removed) {
    notifyIndexNow(url);
    return;
  }
  const approved = car.isApproved === true || car.isApproved === undefined;
  const gone =
    car.isSold === true ||
    ["deleted", "expired", "sold"].includes(String(car.status || ""));
  if (!approved || gone) {
    notifyIndexNow(url);
    return;
  }
  notifyIndexNow(url);
}

export { postBatch as submitIndexNowBatch };
