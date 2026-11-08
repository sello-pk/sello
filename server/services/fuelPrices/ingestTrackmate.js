import { fetchTrackmatePrices } from "./trackmateClient.js";
import { publishVerifiedPrices } from "./publisher.js";
import Logger from "../../utils/logger.js";

/**
 * Pull PSO/Shell/PakWheels retail board via Trackmate and publish.
 * Never overwrites fresher OGRA Premier Euro 5 / HSD rows.
 */
export async function ingestTrackmateFuelPrices() {
  const started = Date.now();
  try {
    const { prices, fetched_at } = await fetchTrackmatePrices();
    if (!prices.length) {
      return {
        ok: false,
        published: 0,
        skipped: 0,
        error: "Trackmate returned no mappable prices",
        duration_ms: Date.now() - started,
      };
    }

    let published = 0;
    let skipped = 0;
    const details = [];

    // Publish each fuel with its own effective date + hash
    for (const row of prices) {
      const result = await publishVerifiedPrices({
        prices: [row],
        effective_date: row.effective_date || fetched_at,
        source_url: row.source_url,
        source_document: row.source_document,
        content_hash: row.content_hash,
        publicationId: null,
        verified_by: "automation",
        notes: row.notes || `Secondary retail board via Trackmate (${row.source})`,
        source_channel: "trackmate",
        protectOgraCore: true,
      });
      for (const item of result.published) {
        if (item.skipped) skipped += 1;
        else published += 1;
        details.push(item);
      }
    }

    Logger.info("Trackmate fuel ingest completed", {
      published,
      skipped,
      fuels: prices.map((p) => p.fuel_type),
    });

    return {
      ok: true,
      published,
      skipped,
      details,
      fuels: prices.map((p) => ({
        fuel_type: p.fuel_type,
        price: p.price,
        source: p.source,
      })),
      duration_ms: Date.now() - started,
    };
  } catch (error) {
    Logger.error("Trackmate fuel ingest failed", error);
    return {
      ok: false,
      published: 0,
      skipped: 0,
      error: error.message,
      duration_ms: Date.now() - started,
    };
  }
}
