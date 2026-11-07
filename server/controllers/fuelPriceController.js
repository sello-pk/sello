import FuelPrice, { FUEL_TYPE_LABELS, FUEL_TYPES } from "../models/fuelPriceModel.js";
import FuelPriceHistory from "../models/fuelPriceHistoryModel.js";
import FuelSourcePublication from "../models/fuelSourcePublicationModel.js";
import FuelAutomationLog from "../models/fuelAutomationLogModel.js";
import FuelAdminCorrection from "../models/fuelAdminCorrectionModel.js";
import { runFuelPriceMonitorJob } from "../services/fuelPrices/runFuelPriceJob.js";
import { publishVerifiedPrices } from "../services/fuelPrices/publisher.js";
import { parseEffectiveDateFromText } from "../services/fuelPrices/ograMonitor.js";
import Logger from "../utils/logger.js";

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message });

export async function getPublicFuelPrices(req, res) {
  try {
    const current = await FuelPrice.find({ publication_status: "published" })
      .sort({ fuel_type: 1 })
      .lean();

    const history = await FuelPriceHistory.find({ publication_status: "published" })
      .sort({ effective_date: -1, createdAt: -1 })
      .limit(120)
      .lean();

    const latestPublication = await FuelSourcePublication.findOne({
      status: { $in: ["published", "validated", "needs_review", "downloaded"] },
    })
      .sort({ effective_date: -1, detected_at: -1 })
      .lean();

    const lastSuccess = await FuelAutomationLog.findOne({ level: "success" })
      .sort({ createdAt: -1 })
      .lean();
    const lastCheck = await FuelAutomationLog.findOne()
      .sort({ createdAt: -1 })
      .lean();

    const verifiedAt = current.reduce((max, row) => {
      const t = row.verified_at ? new Date(row.verified_at).getTime() : 0;
      return t > max ? t : max;
    }, 0);

    return ok(res, {
      current,
      history,
      meta: {
        source_name: "Oil & Gas Regulatory Authority (OGRA)",
        source_portal: "https://price.ogra.org.pk/",
        source_listing: "https://www.ogra.org.pk/notified-petroleum-prices",
        latest_publication: latestPublication,
        last_verified_at: verifiedAt ? new Date(verifiedAt) : null,
        last_successful_update: lastSuccess?.createdAt || null,
        last_check_at: lastCheck?.createdAt || null,
        labels: FUEL_TYPE_LABELS,
      },
    });
  } catch (error) {
    Logger.error("getPublicFuelPrices failed", error);
    return fail(res, "Unable to load fuel prices", 500);
  }
}

export async function getAdminFuelPriceDashboard(req, res) {
  try {
    const [current, latestPublication, lastSuccess, lastCheck, recentLogs, recentPubs, corrections, history] =
      await Promise.all([
        FuelPrice.find().sort({ fuel_type: 1 }).lean(),
        FuelSourcePublication.findOne().sort({ detected_at: -1 }).lean(),
        FuelAutomationLog.findOne({ level: "success" }).sort({ createdAt: -1 }).lean(),
        FuelAutomationLog.findOne().sort({ createdAt: -1 }).lean(),
        FuelAutomationLog.find().sort({ createdAt: -1 }).limit(40).lean(),
        FuelSourcePublication.find().sort({ detected_at: -1 }).limit(25).lean(),
        FuelAdminCorrection.find().sort({ createdAt: -1 }).limit(25).lean(),
        FuelPriceHistory.find().sort({ effective_date: -1 }).limit(60).lean(),
      ]);

    const extractionErrors = recentLogs.filter(
      (log) => log.level === "error" || log.level === "warning"
    );

    return ok(res, {
      current,
      latest_publication: latestPublication,
      last_successful_check: lastCheck,
      last_successful_update: lastSuccess,
      extraction_errors: extractionErrors,
      publications: recentPubs,
      logs: recentLogs,
      corrections,
      history,
      fuel_types: FUEL_TYPES,
      labels: FUEL_TYPE_LABELS,
    });
  } catch (error) {
    Logger.error("getAdminFuelPriceDashboard failed", error);
    return fail(res, "Unable to load fuel price admin dashboard", 500);
  }
}

export async function runFuelPriceCheckNow(req, res) {
  try {
    const summary = await runFuelPriceMonitorJob({
      forceDocumentRef: req.body?.document_ref || null,
    });
    return ok(res, summary);
  } catch (error) {
    Logger.error("runFuelPriceCheckNow failed", error);
    return fail(res, error.message || "Monitor job failed", 500);
  }
}

export async function approveOrCorrectFuelPrice(req, res) {
  try {
    const {
      fuel_type,
      price,
      effective_date,
      reason,
      source_url,
      source_document,
      publication_id,
    } = req.body || {};

    if (!fuel_type || !FUEL_TYPES.includes(fuel_type)) {
      return fail(res, "Invalid fuel_type");
    }
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return fail(res, "Invalid price");
    }
    if (!reason || String(reason).trim().length < 5) {
      return fail(res, "A clear reason is required for manual correction/approval");
    }

    let effective = effective_date ? new Date(effective_date) : null;
    if (!effective || Number.isNaN(effective.getTime())) {
      effective = parseEffectiveDateFromText(String(effective_date || "")) || new Date();
    }

    const current = await FuelPrice.findOne({ fuel_type }).lean();
    const content_hash = `admin:${fuel_type}:${effective.toISOString().slice(0, 10)}:${numericPrice}:${Date.now()}`;

    await FuelAdminCorrection.create({
      fuel_type,
      previous_price: current?.price ?? null,
      corrected_price: numericPrice,
      effective_date: effective,
      reason: String(reason).trim(),
      source_url: source_url || current?.source_url || "https://price.ogra.org.pk/",
      source_document: source_document || current?.source_document || "admin-correction",
      publication_id: publication_id || null,
      approved: true,
      admin_user: req.user._id,
      admin_email: req.user.email || null,
    });

    const result = await publishVerifiedPrices({
      prices: [
        {
          fuel_type,
          label: FUEL_TYPE_LABELS[fuel_type],
          price: numericPrice,
        },
      ],
      effective_date: effective,
      source_url: source_url || current?.source_url || "https://price.ogra.org.pk/",
      source_document: source_document || current?.source_document || "admin-correction",
      content_hash,
      publicationId: publication_id || null,
      verified_by: "admin",
      notes: String(reason).trim(),
    });

    if (publication_id) {
      await FuelSourcePublication.findByIdAndUpdate(publication_id, {
        status: "published",
        processed_at: new Date(),
        "validation.passed": true,
        error_message: null,
      });
    }

    return ok(res, { result });
  } catch (error) {
    Logger.error("approveOrCorrectFuelPrice failed", error);
    return fail(res, error.message || "Correction failed", 500);
  }
}
