import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import FuelPrice from "../../models/fuelPriceModel.js";
import FuelPriceHistory from "../../models/fuelPriceHistoryModel.js";
import FuelSourcePublication from "../../models/fuelSourcePublicationModel.js";
import FuelAutomationLog from "../../models/fuelAutomationLogModel.js";
import Logger from "../../utils/logger.js";
import { discoverOgraPublications } from "./ograMonitor.js";
import { fetchBinary } from "./httpClient.js";
import { extractFromPdfBuffer } from "./pdfExtractor.js";
import { validateExtractedPrices } from "./validator.js";
import { publishVerifiedPrices } from "./publisher.js";
import { ingestTrackmateFuelPrices } from "./ingestTrackmate.js";
import { notifyFuelAdmins } from "./notifyAdmin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = path.join(__dirname, "../../storage/fuel-publications");

async function ensureStorageDir() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
}

async function writeLog(payload) {
  try {
    await FuelAutomationLog.create(payload);
  } catch (error) {
    Logger.error("Failed to write fuel automation log", error);
  }
}

async function getPreviousPriceMap() {
  const current = await FuelPrice.find({ publication_status: "published" }).lean();
  return Object.fromEntries(current.map((row) => [row.fuel_type, row.price]));
}

async function getExistingHashes() {
  const [pubs, history] = await Promise.all([
    FuelSourcePublication.find({ content_hash: { $ne: null } })
      .select("content_hash")
      .lean(),
    FuelPriceHistory.find().select("content_hash").lean(),
  ]);
  return new Set(
    [...pubs, ...history].map((row) => row.content_hash).filter(Boolean)
  );
}

const QUEUE_LIMIT = 12;
const MAX_DATES = 4;
const MAX_DOCS_PER_DATE = 2;

/** Lower priority number = processed first within a publication date. */
function documentPriority(item) {
  if (item.channel === "ogra_press_release") return -100;
  if (typeof item.companion_rank === "number") return item.companion_rank;
  if (item.channel === "ogra_companion") return 50;
  if (item.channel === "price_portal") return 60;
  return 70;
}

function effectiveKeyOf(item) {
  const time = item.effective_date ? new Date(item.effective_date).getTime() : NaN;
  return Number.isFinite(time)
    ? new Date(time).toISOString().slice(0, 10)
    : `ref:${item.document_ref}`;
}

/**
 * Pick a small, date-balanced queue. Taking the newest N items used to let ten
 * companion build-ups for the same notification crowd out the official press
 * release for the previous effective date — which left history without the
 * preceding rate and produced wrong `previous_price`/`change_amount` values.
 *
 * Selection guarantees the newest few publication dates are represented, with
 * at most one press release and one best-ranked build-up per date. The result is
 * ordered oldest → newest so each notification's delta is computed against the
 * rate it actually replaced.
 */
export function selectMonitorQueue(publications, { forceDocumentRef = null } = {}) {
  if (forceDocumentRef) {
    return publications.filter((p) => p.document_ref === forceDocumentRef).slice(0, 1);
  }

  const candidates = publications.filter(
    (p) => p.preferred || p.channel === "ogra_press_release"
  );

  const byDate = new Map();
  for (const item of candidates) {
    const key = effectiveKeyOf(item);
    const group = byDate.get(key) || [];
    group.push(item);
    byDate.set(key, group);
  }

  const dateKeys = [...byDate.keys()]
    .filter((key) => !key.startsWith("ref:"))
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, MAX_DATES);
  for (const key of byDate.keys()) {
    if (key.startsWith("ref:") && dateKeys.length < MAX_DATES) dateKeys.push(key);
  }

  const selected = [];
  for (const key of dateKeys) {
    const group = [...(byDate.get(key) || [])].sort((a, b) => {
      const byPriority = documentPriority(a) - documentPriority(b);
      if (byPriority !== 0) return byPriority;
      // Prefer the newest sibling (closer to the notification) on ties.
      return String(b.document_ref).localeCompare(String(a.document_ref), undefined, {
        numeric: true,
      });
    });

    // Always keep the official press release, then the best build-up sheet.
    const official = group.filter((p) => p.channel === "ogra_press_release");
    const others = group.filter((p) => p.channel !== "ogra_press_release");
    selected.push(...official.slice(0, 1), ...others.slice(0, MAX_DOCS_PER_DATE - 1));
  }

  // Oldest first so history gets the preceding rate before the newer notification.
  selected.sort((a, b) => {
    const at = a.effective_date ? new Date(a.effective_date).getTime() : 0;
    const bt = b.effective_date ? new Date(b.effective_date).getTime() : 0;
    if (at !== bt) return at - bt;
    return documentPriority(a) - documentPriority(b);
  });

  return selected.slice(0, QUEUE_LIMIT);
}

export async function runFuelPriceMonitorJob({ forceDocumentRef = null } = {}) {
  const startedAt = new Date();
  const summary = {
    discovered: 0,
    downloaded: 0,
    published: 0,
    skipped: 0,
    needs_review: 0,
    failed: 0,
    errors: [],
  };

  try {
    await ensureStorageDir();
    const { publications, errors: discoveryErrors, checkedAt } =
      await discoverOgraPublications();
    summary.discovered = publications.length;

    if (discoveryErrors.length) {
      summary.errors.push(...discoveryErrors);
      await writeLog({
        level: "warning",
        message: "Partial OGRA discovery failures",
        details: { discoveryErrors, checkedAt },
        started_at: startedAt,
        finished_at: new Date(),
        duration_ms: Date.now() - startedAt.getTime(),
      });
      await notifyFuelAdmins({
        title: "Fuel price source check warning",
        message: `Some OGRA sources failed during discovery: ${discoveryErrors
          .map((e) => e.source)
          .join(", ")}`,
        type: "warning",
        metadata: { discoveryErrors },
      });
    }

    if (!publications.length) {
      await writeLog({
        level: "error",
        message: "No OGRA publications discovered",
        details: { discoveryErrors, checkedAt },
        started_at: startedAt,
        finished_at: new Date(),
        duration_ms: Date.now() - startedAt.getTime(),
      });
      await notifyFuelAdmins({
        title: "OGRA fuel source unavailable",
        message:
          "Fuel price monitor found no publications on OGRA listings. Previous verified prices were kept.",
        type: "error",
      });
      return summary;
    }

    const existingHashes = await getExistingHashes();
    const previousPrices = await getPreviousPriceMap();

    // Prefer newest official build-ups + notified petroleum sheets (incl. companion
    // downloads near scanned gazette PDFs). price.ogra.org.pk can lag ogra.org.pk.
    // Selection is date-balanced and ordered oldest-first so previous prices line up.
    const queue = selectMonitorQueue(publications, { forceDocumentRef });

    const publishedEffectiveKeys = new Set();

    for (const item of queue) {
      const effectiveKey = item.effective_date
        ? new Date(item.effective_date).toISOString().slice(0, 10)
        : null;
      if (
        item.companion_of &&
        effectiveKey &&
        publishedEffectiveKeys.has(effectiveKey) &&
        !forceDocumentRef
      ) {
        summary.skipped += 1;
        continue;
      }

      let publication = await FuelSourcePublication.findOne({
        document_ref: item.document_ref,
      });

      if (
        publication &&
        ["published", "duplicate", "skipped"].includes(publication.status) &&
        !forceDocumentRef
      ) {
        summary.skipped += 1;
        continue;
      }

      if (!publication) {
        publication = await FuelSourcePublication.create({
          document_ref: item.document_ref,
          title: item.title,
          source_url: item.source_url,
          listing_url: item.listing_url,
          notification_date: item.effective_date,
          effective_date: item.effective_date,
          detected_at: new Date(),
          status: "detected",
        });
      }

      try {
        const file = await fetchBinary(item.source_url);
        summary.downloaded += 1;

        const safeName = `${item.document_ref.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
        const localPath = path.join(STORAGE_DIR, safeName);
        await fs.writeFile(localPath, file.buffer);

        publication.filename = file.filename || safeName;
        publication.content_type = file.contentType;
        publication.byte_size = file.buffer.length;
        publication.downloaded_at = new Date();
        publication.local_path = localPath;
        publication.source_url = file.url || item.source_url;
        publication.status = "downloaded";
        await publication.save();

        const extracted = await extractFromPdfBuffer(file.buffer, {
          title: item.title,
          effective_date: item.effective_date,
        });

        publication.content_hash = extracted.content_hash;
        publication.extraction_method = extracted.method;
        publication.extracted_prices = extracted.prices || [];
        publication.effective_date =
          extracted.effective_date || item.effective_date || publication.effective_date;

        if (!extracted.ok) {
          publication.status = "needs_review";
          publication.error_message =
            extracted.error || "Extraction produced no usable fuel prices";
          publication.validation = {
            passed: false,
            errors: [publication.error_message],
            warnings: extracted.warnings || [],
          };
          publication.processed_at = new Date();
          await publication.save();
          summary.needs_review += 1;
          summary.failed += 1;

          await writeLog({
            level: "error",
            message: "Fuel price extraction failed",
            details: {
              document_ref: item.document_ref,
              error: publication.error_message,
              warnings: extracted.warnings,
            },
            publication_id: publication._id,
            started_at: startedAt,
            finished_at: new Date(),
          });

          await notifyFuelAdmins({
            title: "Fuel price extraction failed",
            message: `${item.title}: ${publication.error_message}. Previous verified prices kept.`,
            type: "error",
            metadata: { document_ref: item.document_ref },
          });
          continue;
        }

        if (existingHashes.has(extracted.content_hash)) {
          publication.status = "duplicate";
          publication.processed_at = new Date();
          publication.validation = {
            passed: false,
            errors: ["Duplicate source document content hash"],
            warnings: extracted.warnings || [],
          };
          await publication.save();
          summary.skipped += 1;
          continue;
        }

        const validation = validateExtractedPrices({
          prices: extracted.prices,
          effective_date: publication.effective_date,
          previousPrices,
        });

        publication.validation = {
          passed: validation.passed,
          errors: validation.errors,
          warnings: [...(extracted.warnings || []), ...validation.warnings],
        };

        if (!validation.passed) {
          publication.status = "needs_review";
          publication.error_message = validation.errors.join("; ");
          publication.processed_at = new Date();
          await publication.save();
          summary.needs_review += 1;

          await writeLog({
            level: "warning",
            message: "Fuel price validation failed — not publishing",
            details: {
              document_ref: item.document_ref,
              errors: validation.errors,
              warnings: validation.warnings,
            },
            publication_id: publication._id,
            started_at: startedAt,
            finished_at: new Date(),
          });

          await notifyFuelAdmins({
            title: "Fuel price validation failed",
            message: `${item.title} failed validation and was not published. Previous verified prices kept.`,
            type: "warning",
            metadata: {
              document_ref: item.document_ref,
              errors: validation.errors,
            },
          });
          continue;
        }

        publication.status = "validated";
        await publication.save();

        const result = await publishVerifiedPrices({
          prices: validation.normalizedPrices,
          effective_date: publication.effective_date,
          source_url: publication.source_url,
          source_document: publication.filename || publication.title,
          content_hash: extracted.content_hash,
          publicationId: publication._id,
          verified_by: "automation",
        });

        existingHashes.add(extracted.content_hash);
        for (const row of validation.normalizedPrices) {
          previousPrices[row.fuel_type] = row.price;
        }
        if (publication.effective_date) {
          publishedEffectiveKeys.add(
            new Date(publication.effective_date).toISOString().slice(0, 10)
          );
        }

        summary.published += result.published.filter((p) => !p.skipped).length;

        await writeLog({
          level: "success",
          message: "Published verified OGRA fuel prices",
          details: {
            document_ref: item.document_ref,
            title: item.title,
            published: result.published,
            warnings: publication.validation.warnings,
          },
          publication_id: publication._id,
          started_at: startedAt,
          finished_at: new Date(),
          duration_ms: Date.now() - startedAt.getTime(),
        });
      } catch (error) {
        summary.failed += 1;
        publication.status = "failed";
        publication.error_message = error.message;
        publication.processed_at = new Date();
        await publication.save();

        await writeLog({
          level: "error",
          message: "Fuel price document processing failed",
          details: { document_ref: item.document_ref, error: error.message },
          publication_id: publication._id,
          started_at: startedAt,
          finished_at: new Date(),
        });

        await notifyFuelAdmins({
          title: "Fuel price processing error",
          message: `${item.title}: ${error.message}. Previous verified prices kept.`,
          type: "error",
          metadata: { document_ref: item.document_ref },
        });
      }
    }

    // Secondary retail board (PSO / Shell / PakWheels) for Hi-Octane, LPG, SKO, LDO
    // and as fallback when OGRA PDFs lag. Never overwrites fresher OGRA MS/HSD.
    try {
      const trackmate = await ingestTrackmateFuelPrices();
      summary.trackmate = trackmate;
      if (trackmate.ok) {
        summary.published += trackmate.published || 0;
        summary.skipped += trackmate.skipped || 0;
      } else {
        summary.errors.push({
          source: "trackmate",
          message: trackmate.error || "Trackmate ingest failed",
        });
      }
    } catch (tmError) {
      summary.errors.push({ source: "trackmate", message: tmError.message });
      Logger.error("Trackmate ingest threw", tmError);
    }

    await writeLog({
      level: summary.failed ? "warning" : "info",
      message: "Fuel price monitor cycle completed",
      details: summary,
      started_at: startedAt,
      finished_at: new Date(),
      duration_ms: Date.now() - startedAt.getTime(),
    });

    return summary;
  } catch (error) {
    Logger.error("Fuel price monitor job crashed", error);
    await writeLog({
      level: "error",
      message: "Fuel price monitor job crashed",
      details: { error: error.message },
      started_at: startedAt,
      finished_at: new Date(),
      duration_ms: Date.now() - startedAt.getTime(),
    });
    await notifyFuelAdmins({
      title: "Fuel price automation crashed",
      message: error.message,
      type: "error",
    });
    throw error;
  }
}

export default runFuelPriceMonitorJob;
