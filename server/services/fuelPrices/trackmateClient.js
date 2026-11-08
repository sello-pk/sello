/**
 * Secondary retail fuel prices via the public Trackmate fuel-api
 * (scrapes PSO / Shell / PakWheels). OGRA PDFs remain authoritative for
 * Premier Euro 5 + HSD when available.
 *
 * Docs: https://fuel.trackmate.page/
 * API:  https://fuel.trackmate.page/api/prices
 */

import crypto from "crypto";
import {
  FUEL_TYPE_LABELS,
  FUEL_DEFAULT_UNIT,
} from "../../models/fuelPriceModel.js";
import { USER_AGENT, REQUEST_TIMEOUT_MS } from "./constants.js";

export const TRACKMATE_API_BASE = "https://fuel.trackmate.page/api";
export const TRACKMATE_PRICES_URL = `${TRACKMATE_API_BASE}/prices`;

/** Trackmate product → our fuel_type */
const PRODUCT_MAP = {
  petrol: "motor_spirit",
  hsd: "high_speed_diesel",
  kerosene: "kerosene_oil",
  lsd: "light_diesel_oil",
  ldo: "light_diesel_oil",
  lpg: "lpg",
  octane_plus: "hi_octane",
  hi_octane: "hi_octane",
};

const SOURCE_PRIORITY = { pakwheels: 3, pso: 2, shell: 1 };

function parseTrackmateDate(value) {
  if (!value) return null;
  // "07-November-2026"
  const m = String(value).match(/^(\d{1,2})-([A-Za-z]+)-(\d{4})$/);
  if (!m) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const day = Number(m[1]);
  const monthName = m[2].toLowerCase();
  const year = Number(m[3]);
  const months = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };
  const month = months[monthName];
  if (month == null) return null;
  return new Date(Date.UTC(year, month, day));
}

/**
 * Pick one national row per fuel_type from mixed PSO/Shell/PakWheels rows.
 * Prefer PakWheels national (has effective_date), then PSO national, then Shell.
 * For city-only products (octane_plus), use the modal/most-common city price
 * (falls back to Karachi, then first).
 */
export function normalizeTrackmatePrices(payload) {
  const rows = Array.isArray(payload?.prices) ? payload.prices : [];
  const byFuel = new Map();

  for (const row of rows) {
    const fuel_type = PRODUCT_MAP[row.product];
    if (!fuel_type) continue;
    if (!Number.isFinite(Number(row.price_pkr))) continue;

    const candidate = {
      fuel_type,
      label: FUEL_TYPE_LABELS[fuel_type],
      price: Number(row.price_pkr),
      currency: "PKR",
      unit:
        row.unit === "kg"
          ? "per_kg"
          : FUEL_DEFAULT_UNIT[fuel_type] || "per_litre",
      effective_date: parseTrackmateDate(row.effective_date) || new Date(row.scraped_at),
      source: row.source,
      city: row.city || null,
      scraped_at: row.scraped_at ? new Date(row.scraped_at) : new Date(),
      source_url: TRACKMATE_PRICES_URL,
      source_document: `trackmate:${row.source}:${row.product}${
        row.city ? `:${row.city}` : ""
      }`,
    };

    const existing = byFuel.get(fuel_type);
    if (!existing) {
      byFuel.set(fuel_type, {
        ...candidate,
        _cityPrices: row.city ? [candidate] : [],
      });
      continue;
    }

    // Accumulate city prices for hi-octane
    if (row.city) {
      existing._cityPrices = existing._cityPrices || [];
      existing._cityPrices.push(candidate);
    }

    const existingPri = SOURCE_PRIORITY[existing.source] || 0;
    const nextPri = SOURCE_PRIORITY[row.source] || 0;
    const existingNational = !existing.city;
    const nextNational = !row.city;

    // Prefer national rows; among nationals prefer higher source priority / newer date
    if (nextNational && !existingNational) {
      byFuel.set(fuel_type, {
        ...candidate,
        _cityPrices: existing._cityPrices || [],
      });
      continue;
    }
    if (!nextNational && existingNational) continue;

    if (nextPri > existingPri) {
      byFuel.set(fuel_type, {
        ...candidate,
        _cityPrices: existing._cityPrices || [],
      });
      continue;
    }
    if (nextPri === existingPri) {
      const et = existing.effective_date?.getTime?.() || 0;
      const nt = candidate.effective_date?.getTime?.() || 0;
      if (nt > et) {
        byFuel.set(fuel_type, {
          ...candidate,
          _cityPrices: existing._cityPrices || [],
        });
      }
    }
  }

  // Hi-octane: if only city rows, take modal price (or Karachi)
  for (const [fuel_type, row] of byFuel) {
    if (fuel_type !== "hi_octane") continue;
    const cities = row._cityPrices || [];
    if (!row.city && cities.length === 0) continue;
    if (!row.city) continue; // already national

    const karachi = cities.find((c) => /karachi/i.test(c.city || ""));
    if (karachi) {
      byFuel.set(fuel_type, { ...karachi, _cityPrices: cities });
      continue;
    }
    const counts = new Map();
    for (const c of cities) {
      counts.set(c.price, (counts.get(c.price) || 0) + 1);
    }
    let bestPrice = row.price;
    let bestCount = 0;
    for (const [price, count] of counts) {
      if (count > bestCount) {
        bestCount = count;
        bestPrice = price;
      }
    }
    const sample = cities.find((c) => c.price === bestPrice) || row;
    byFuel.set(fuel_type, {
      ...sample,
      city: null,
      notes: `PSO Octane+ reference (modal city price Rs ${bestPrice})`,
      _cityPrices: cities,
    });
  }

  return [...byFuel.values()].map(({ _cityPrices, ...rest }) => {
    const hash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          fuel_type: rest.fuel_type,
          price: rest.price,
          effective_date: rest.effective_date?.toISOString?.(),
          source: rest.source,
        })
      )
      .digest("hex");
    return { ...rest, content_hash: hash };
  });
}

export async function fetchTrackmatePrices() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(TRACKMATE_PRICES_URL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
    });
    if (!res.ok) {
      throw new Error(`Trackmate HTTP ${res.status}`);
    }
    const json = await res.json();
    return {
      ok: true,
      raw: json,
      prices: normalizeTrackmatePrices(json),
      fetched_at: new Date(),
    };
  } finally {
    clearTimeout(timer);
  }
}
