import { PRICE_SANITY, FUEL_ALIASES } from "./constants.js";

const CORE_FUELS = ["motor_spirit", "high_speed_diesel"];

export function validateExtractedPrices({
  prices = [],
  effective_date = null,
  previousPrices = {},
}) {
  const errors = [];
  const warnings = [];

  if (!effective_date || Number.isNaN(new Date(effective_date).getTime())) {
    errors.push("Missing or invalid effective date");
  } else {
    const effective = new Date(effective_date);
    const now = new Date();
    const earliest = new Date("2005-01-01T00:00:00Z");
    if (effective > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      errors.push("Effective date is too far in the future");
    }
    if (effective < earliest) {
      errors.push("Effective date is unrealistically old");
    }
  }

  const byType = new Map();
  for (const row of prices) {
    if (!row?.fuel_type || !FUEL_ALIASES.some((a) => a.fuel_type === row.fuel_type)) {
      errors.push(`Unknown fuel category: ${row?.fuel_type}`);
      continue;
    }
    if (byType.has(row.fuel_type)) {
      errors.push(`Duplicate fuel category in extraction: ${row.fuel_type}`);
      continue;
    }
    if (row.currency && String(row.currency).toUpperCase() !== "PKR") {
      errors.push(`${row.fuel_type}: currency must be PKR`);
    }
    if (row.unit && !/per[_\s-]?litre/i.test(String(row.unit))) {
      errors.push(`${row.fuel_type}: unit must be per litre`);
    }
    if (!Number.isFinite(row.price)) {
      errors.push(`${row.fuel_type}: price is not a number`);
      continue;
    }
    if (row.price < PRICE_SANITY.min || row.price > PRICE_SANITY.max) {
      errors.push(
        `${row.fuel_type}: price ${row.price} outside sanity band ${PRICE_SANITY.min}-${PRICE_SANITY.max} PKR/litre`
      );
      continue;
    }

    const prev = previousPrices[row.fuel_type];
    if (prev != null && Number.isFinite(prev)) {
      const delta = Math.abs(row.price - prev);
      if (delta > 80) {
        warnings.push(
          `${row.fuel_type}: large move of ${delta.toFixed(2)} vs previous ${prev}`
        );
      }
      if (delta > 150) {
        errors.push(
          `${row.fuel_type}: suspicious jump of ${delta.toFixed(2)} PKR vs previous verified price`
        );
      }
    }

    byType.set(row.fuel_type, row);
  }

  for (const core of CORE_FUELS) {
    if (!byType.has(core)) {
      errors.push(`Incomplete extraction: missing core fuel ${core}`);
    }
  }

  // Optional fuels: warn only
  for (const optional of ["kerosene_oil", "light_diesel_oil"]) {
    if (!byType.has(optional)) {
      warnings.push(`Optional fuel not found in document: ${optional}`);
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    normalizedPrices: [...byType.values()],
  };
}
