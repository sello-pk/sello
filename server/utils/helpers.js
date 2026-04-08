import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";
import { EMAIL_CONFIG } from "../config/index.js";
import AuditLog from "../models/auditLogModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* -------------------------------------------------------------------------- */
/*                               LOGGER UTILITY                               */
/* -------------------------------------------------------------------------- */

export class Logger {
  static info(msg, meta = {}) {
    console.log(`[INFO] ${msg}`, meta);
  }
  static warn(msg, meta = {}) {
    console.warn(`[WARN] ${msg}`, meta);
  }
  static error(msg, err = null, meta = {}) {
    console.error(`[ERROR] ${msg}`, err, meta);
  }
  static analytics(event, userId, meta = {}) {
    console.log(`[ANALYTICS] ${event}`, { userId, ...meta });
  }
  static request(req, res, responseTime) {
    const url = req.originalUrl || req.url || "";
    // Keep logs readable: conditional/etag cache hits are expected and frequent.
    if (res.statusCode === 304) return;
    if (req.method === "OPTIONS") return;

    const msg = `${req.method} ${url} ${res.statusCode} ${responseTime}ms`;
    if (res.statusCode >= 500) this.error(`API Error: ${msg}`);
    else if (res.statusCode >= 400) {
      // 401 on refresh-token or blog comments is expected when not logged in – log as info to reduce noise
      const expected401 =
        res.statusCode === 401 &&
        (url.includes("/auth/refresh-token") || url.includes("/comments"));
      if (expected401) this.info(`API Request: ${msg}`);
      else this.warn(`API Warning: ${msg}`);
    } else this.info(`API Request: ${msg}`);
  }
  static query(operation, collection, duration, meta = {}) {
    const msg = `DB Query: ${operation} ${collection} (${duration}ms)`;
    if (duration > 500) this.warn(msg, meta);
    else this.info(msg, meta);
  }
}

export const createAuditLog = async (
  actor,
  action,
  details = {},
  target = null,
  req = null,
) => {
  try {
    await AuditLog.create({
      actor: actor._id || actor,
      actorEmail: actor.email,
      action,
      details,
      target: target?._id || target,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
      timestamp: new Date(),
    });
  } catch (e) {
    console.error("Audit log failed", e.message);
  }
};

export const getAuditLogs = async (query = {}, options = {}) => {
  const { limit = 100, skip = 0, sort = { timestamp: -1 } } = options;
  return await AuditLog.find(query)
    .populate("actor", "name email")
    .populate("target", "name email")
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

/* -------------------------------------------------------------------------- */
/*                              VALIDATORS UTILITY                            */
/* -------------------------------------------------------------------------- */

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
export const safeParseInt = (v, d = 0) =>
  isNaN(parseInt(v)) ? d : parseInt(v);
export const safeParseFloat = (v, d = 0) =>
  isNaN(parseFloat(v)) ? d : parseFloat(v);
export const safeParseJSON = (s, d = null) => {
  try {
    return JSON.parse(s);
  } catch {
    return d;
  }
};
export const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const parseArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val))
    return val.map((v) => String(v).trim()).filter(Boolean);
  try {
    const p = JSON.parse(val);
    if (Array.isArray(p)) return p.map((v) => String(v).trim()).filter(Boolean);
  } catch {}
  return String(val)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

/* -------------------------------------------------------------------------- */
/*                              CLOUDINARY UTILITY                            */
/* -------------------------------------------------------------------------- */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Max concurrent uploads to Cloudinary — balanced for speed + reliability */
const LISTING_UPLOAD_CONCURRENCY = Math.max(
  1,
  parseInt(process.env.CLOUDINARY_UPLOAD_CONCURRENCY, 10) || 3,
);
const LISTING_UPLOAD_RETRIES = Math.max(
  1,
  parseInt(process.env.CLOUDINARY_UPLOAD_RETRIES, 10) || 3,
);
const LISTING_UPLOAD_MAX_CONCURRENCY = Math.max(
  LISTING_UPLOAD_CONCURRENCY,
  parseInt(process.env.CLOUDINARY_UPLOAD_MAX_CONCURRENCY, 10) || 4,
);

function isTransientCloudinaryError(err) {
  const code = err?.http_code ?? err?.error?.http_code ?? err?.statusCode;
  const name = err?.name ?? err?.error?.name;
  const msg = (err?.message || "").toLowerCase();
  if (code === 502 || code === 503 || code === 499) return true;
  if (name === "TimeoutError") return true;
  if (
    msg.includes("502") ||
    msg.includes("timeout") ||
    msg.includes("unexpected status")
  )
    return true;
  return false;
}

/**
 * Upload buffer to Cloudinary (single call, no retry).
 * transformation: limit width/height so Cloudinary stores smaller derivatives.
 */
export const uploadCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      reject(new Error("Invalid file buffer for upload"));
      return;
    }

    // Scale timeout by payload size to reduce false timeouts on larger photos.
    const bytes = fileBuffer.length || 0;
    const timeoutMs =
      options.timeout ||
      Math.max(45000, Math.min(120000, 45000 + Math.ceil(bytes / 200000)));
    const timeout = setTimeout(() => {
      reject(new Error("Upload timeout"));
      stream.destroy();
    }, timeoutMs);

    const uploadOptions = {
      folder: options.folder || "sello_uploads",
      resource_type: "image",
      // Lighter processing = fewer 502s under load (no eager transform chain on upload)
      quality: options.quality ?? "auto:eco",
      fetch_format: "auto",
      transformation: options.transformation || [
        { width: 1200, height: 1200, crop: "limit" }, // Reduced size for faster upload
      ],
    };
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (err, res) => {
        clearTimeout(timeout);
        if (err) reject(err);
        else if (!res?.secure_url)
          reject(new Error("Cloudinary returned no URL"));
        else resolve(res.secure_url);
      },
    );
    stream.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
    stream.end(fileBuffer);
  });
};

/**
 * Upload a raw file (e.g. PDF) to Cloudinary. Use for inspection reports and documents.
 */
export const uploadRawToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      reject(new Error("Invalid file buffer for raw upload"));
      return;
    }

    // Add timeout to prevent hanging
    const timeoutMs = options.timeout || 90000; // 90 seconds timeout for PDFs/docs
    const timeout = setTimeout(() => {
      reject(new Error("Upload timeout"));
      stream.destroy();
    }, timeoutMs);

    const folder = options.folder || "sello_uploads";
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw" },
      (err, res) => {
        clearTimeout(timeout);
        if (err) reject(err);
        else if (!res?.secure_url)
          reject(new Error("Cloudinary returned no URL"));
        else resolve(res.secure_url);
      },
    );
    stream.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
    stream.end(fileBuffer);
  });
};

/**
 * Upload one buffer with retries (502/503/timeout).
 */
async function uploadCloudinaryWithRetry(fileBuffer, options = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= LISTING_UPLOAD_RETRIES; attempt++) {
    try {
      return await uploadCloudinary(fileBuffer, options);
    } catch (err) {
      lastErr = err;
      if (
        !isTransientCloudinaryError(err) ||
        attempt === LISTING_UPLOAD_RETRIES
      ) {
        throw err;
      }
      const delayMs = 800 * attempt;
      Logger.warn("Cloudinary upload retry", {
        attempt,
        delayMs,
        http_code: err?.http_code,
        name: err?.name,
      });
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

/**
 * Upload one raw buffer (PDF/docs) with retries for transient Cloudinary failures.
 */
export async function uploadRawToCloudinaryWithRetry(fileBuffer, options = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= LISTING_UPLOAD_RETRIES; attempt++) {
    try {
      return await uploadRawToCloudinary(fileBuffer, options);
    } catch (err) {
      lastErr = err;
      if (
        !isTransientCloudinaryError(err) ||
        attempt === LISTING_UPLOAD_RETRIES
      ) {
        throw err;
      }
      const delayMs = 1000 * attempt;
      Logger.warn("Cloudinary raw upload retry", {
        attempt,
        delayMs,
        http_code: err?.http_code,
        name: err?.name,
      });
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

/**
 * Upload many listing images with bounded concurrency + retries.
 * Avoids 15 parallel streams → 502 / Request Timeout (499).
 */
export async function uploadListingImagesToCloudinary(files, options = {}) {
  const folder = options.folder || "sello_cars";
  if (!files?.length) return [];

  const buffers = files.map((f) => f.buffer).filter(Boolean);
  const totalBytes = buffers.reduce((sum, b) => sum + (b?.length || 0), 0);
  let adaptiveConcurrency = LISTING_UPLOAD_CONCURRENCY;
  if (totalBytes <= 10 * 1024 * 1024) adaptiveConcurrency = 4;
  else if (totalBytes <= 30 * 1024 * 1024) adaptiveConcurrency = 3;
  else adaptiveConcurrency = 2;
  const effectiveConcurrency = Math.max(
    1,
    Math.min(LISTING_UPLOAD_MAX_CONCURRENCY, adaptiveConcurrency),
  );

  Logger.info("Listing image upload scheduling", {
    count: buffers.length,
    totalMB: Math.round((totalBytes / (1024 * 1024)) * 100) / 100,
    concurrency: effectiveConcurrency,
    retries: LISTING_UPLOAD_RETRIES,
  });

  const urls = [];

  for (let i = 0; i < buffers.length; i += effectiveConcurrency) {
    const chunk = buffers.slice(i, i + effectiveConcurrency);
    const chunkUrls = await Promise.all(
      chunk.map((buffer) => uploadCloudinaryWithRetry(buffer, { folder })),
    );
    urls.push(...chunkUrls);
  }
  return urls;
}

/* -------------------------------------------------------------------------- */
/*                                EMAIL UTILITY                               */
/* -------------------------------------------------------------------------- */

export const sendEmail = async (to, subject, html) => {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS === "false")
    return { actuallySent: false };
  const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.HOST,
    port: EMAIL_CONFIG.PORT,
    secure: EMAIL_CONFIG.PORT === 465,
    auth: { user: EMAIL_CONFIG.MAIL, pass: EMAIL_CONFIG.PASSWORD },
  });
  try {
    const info = await transporter.sendMail({
      from: EMAIL_CONFIG.MAIL,
      to,
      subject,
      html,
    });
    return { actuallySent: true, messageId: info.messageId };
  } catch (e) {
    Logger.error("Email failed", e);
    throw e;
  }
};

/* -------------------------------------------------------------------------- */
/*                                PHONE UTILITY                               */
/* -------------------------------------------------------------------------- */

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendVerificationCode = async (phone, code) => {
  Logger.info(`OTP for ${phone}: ${code}`);
  return { success: true };
};

/* -------------------------------------------------------------------------- */
/*                              ANALYTICS UTILITY                            */
/* -------------------------------------------------------------------------- */

export const trackEvent = async (event, userId = null, metadata = {}) => {
  Logger.analytics(event, userId, metadata);
};

/* -------------------------------------------------------------------------- */
/*                                QUERY BUILDER                               */
/* -------------------------------------------------------------------------- */

export const buildCarQuery = (query) => {
  const filter = {};
  
  // Debug: Log incoming query
  console.log('🔍 buildCarQuery - Input query:', query);

  // 1. Keyword search (Across title, make, model, description)
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [
      { title: regex },
      { make: regex },
      { description: regex },
    ];
  }

  // 2. Exact match fields (make needs exact match for brand filtering)
  const exactMatchFields = [
    "make",
    "variant",
    "condition",
    "transmission",
    "fuelType",
    "city",
    "vehicleType",
    "bodyType",
    "ownerType",
    "warranty",
  ];

  exactMatchFields.forEach((field) => {
    if (query[field]) {
      // Use case-insensitive exact match for robustness
      filter[field] = { $regex: new RegExp(`^${query[field]}$`, "i") };
    }
  });

  // 2b. Partial match fields (model should be more flexible)
  if (query.model) {
    // Use case-insensitive partial match for model to allow "City" to match "Civic", etc.
    filter.model = { $regex: new RegExp(query.model, "i") };
    console.log('🔍 buildCarQuery - Model filter applied:', filter.model);
  }

  // 3. Numeric range fields
  const rangeFields = [
    { key: "price", min: "priceMin", max: "priceMax" },
    { key: "year", min: "yearMin", max: "yearMax" },
    { key: "mileage", min: "mileageMin", max: "mileageMax" },
    { key: "batteryRange", min: "batteryRangeMin", max: "batteryRangeMax" },
    { key: "motorPower", min: "motorPowerMin", max: "motorPowerMax" },
  ];

  rangeFields.forEach(({ key, min, max }) => {
    if (query[min] || query[max]) {
      filter[key] = {};
      if (query[min]) filter[key].$gte = Number(query[min]);
      if (query[max]) filter[key].$lte = Number(query[max]);
    }
  });

  // 4. Specific boolean / flag fields
  if (query.featured === "true") filter.featured = true;
  if (query.isApproved === "true") filter.isApproved = true;

  
  // Debug: Log final filter
  console.log('🔍 buildCarQuery - Final filter:', JSON.stringify(filter, null, 2));
  
  return { filter };
};

export default {
  Logger,
  createAuditLog,
  getAuditLogs,
  isValidObjectId,
  safeParseInt,
  parseArray,
  uploadCloudinary,
  sendEmail,
  generateOtp,
  trackEvent,
  buildCarQuery,
};
