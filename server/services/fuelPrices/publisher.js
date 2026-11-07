import FuelPrice, { FUEL_TYPE_LABELS } from "../../models/fuelPriceModel.js";
import FuelPriceHistory from "../../models/fuelPriceHistoryModel.js";
import FuelSourcePublication from "../../models/fuelSourcePublicationModel.js";

function toTime(value) {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(t) ? t : null;
}

export async function publishVerifiedPrices({
  prices,
  effective_date,
  source_url,
  source_document,
  content_hash,
  publicationId,
  verified_by = "automation",
  notes = null,
}) {
  const fetched_at = new Date();
  const verified_at = new Date();
  const published = [];
  const effectiveTime = toTime(effective_date);

  for (const row of prices) {
    const current = await FuelPrice.findOne({ fuel_type: row.fuel_type });

    // Chronological previous snapshot (for history deltas), not whatever is currently displayed.
    const priorHistory = await FuelPriceHistory.findOne({
      fuel_type: row.fuel_type,
      publication_status: "published",
      effective_date: { $lt: effective_date },
    })
      .sort({ effective_date: -1 })
      .lean();

    const previous_price = priorHistory?.price ?? current?.price ?? null;
    const change_amount =
      previous_price == null
        ? null
        : Number((row.price - previous_price).toFixed(2));

    const existingHistory = await FuelPriceHistory.findOne({
      fuel_type: row.fuel_type,
      effective_date,
      content_hash,
    });
    if (existingHistory) {
      published.push({
        fuel_type: row.fuel_type,
        skipped: true,
        reason: "duplicate_history",
      });
      continue;
    }

    const sameSnapshot = await FuelPriceHistory.findOne({
      fuel_type: row.fuel_type,
      effective_date,
      price: row.price,
      publication_status: "published",
    });
    if (sameSnapshot && sameSnapshot.content_hash === content_hash) {
      published.push({
        fuel_type: row.fuel_type,
        skipped: true,
        reason: "identical_snapshot",
      });
      continue;
    }

    await FuelPriceHistory.create({
      fuel_type: row.fuel_type,
      label: row.label || FUEL_TYPE_LABELS[row.fuel_type],
      price: row.price,
      previous_price,
      change_amount,
      currency: "PKR",
      unit: "per_litre",
      effective_date,
      source_url,
      source_document,
      source_publication_id: publicationId || null,
      content_hash,
      fetched_at,
      verified_at,
      publication_status: "published",
      verified_by,
      notes,
    });

    // Current table must always reflect the newest effective_date, never an older backfill.
    const currentEffectiveTime = toTime(current?.effective_date);
    const shouldUpdateCurrent =
      !current ||
      currentEffectiveTime == null ||
      effectiveTime == null ||
      effectiveTime >= currentEffectiveTime;

    if (shouldUpdateCurrent) {
      const displayPrevious =
        current && currentEffectiveTime != null && effectiveTime > currentEffectiveTime
          ? current.price
          : previous_price;
      const displayChange =
        displayPrevious == null
          ? null
          : Number((row.price - displayPrevious).toFixed(2));

      await FuelPrice.findOneAndUpdate(
        { fuel_type: row.fuel_type },
        {
          fuel_type: row.fuel_type,
          label: row.label || FUEL_TYPE_LABELS[row.fuel_type],
          price: row.price,
          previous_price: displayPrevious,
          change_amount: displayChange,
          currency: "PKR",
          unit: "per_litre",
          effective_date,
          source_url,
          source_document,
          source_publication_id: publicationId || null,
          fetched_at,
          verified_at,
          publication_status: "published",
          verified_by,
          notes,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    published.push({
      fuel_type: row.fuel_type,
      price: row.price,
      previous_price,
      change_amount,
      skipped: false,
      updated_current: shouldUpdateCurrent,
    });
  }

  if (publicationId) {
    await FuelSourcePublication.findByIdAndUpdate(publicationId, {
      status: "published",
      processed_at: new Date(),
      "validation.passed": true,
    });
  }

  return { published, verified_at };
}

/** Rebuild FuelPrice "current" rows from the newest history snapshot per fuel. */
export async function rebuildCurrentPricesFromHistory() {
  const fuels = await FuelPriceHistory.distinct("fuel_type", {
    publication_status: "published",
  });
  const rebuilt = [];

  for (const fuel_type of fuels) {
    const latest = await FuelPriceHistory.findOne({
      fuel_type,
      publication_status: "published",
    })
      .sort({ effective_date: -1, verified_at: -1 })
      .lean();
    if (!latest) continue;

    const prior = await FuelPriceHistory.findOne({
      fuel_type,
      publication_status: "published",
      effective_date: { $lt: latest.effective_date },
    })
      .sort({ effective_date: -1 })
      .lean();

    const previous_price = prior?.price ?? null;
    const change_amount =
      previous_price == null
        ? null
        : Number((latest.price - previous_price).toFixed(2));

    await FuelPrice.findOneAndUpdate(
      { fuel_type },
      {
        fuel_type,
        label: latest.label || FUEL_TYPE_LABELS[fuel_type],
        price: latest.price,
        previous_price,
        change_amount,
        currency: latest.currency || "PKR",
        unit: latest.unit || "per_litre",
        effective_date: latest.effective_date,
        source_url: latest.source_url,
        source_document: latest.source_document,
        source_publication_id: latest.source_publication_id,
        fetched_at: latest.fetched_at,
        verified_at: latest.verified_at,
        publication_status: "published",
        verified_by: latest.verified_by || "automation",
        notes: latest.notes || null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    rebuilt.push({
      fuel_type,
      price: latest.price,
      effective_date: latest.effective_date,
    });
  }

  return rebuilt;
}
