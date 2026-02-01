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
  static info(msg, meta = {}) { console.log(`[INFO] ${msg}`, meta); }
  static warn(msg, meta = {}) { console.warn(`[WARN] ${msg}`, meta); }
  static error(msg, err = null, meta = {}) { console.error(`[ERROR] ${msg}`, err, meta); }
  static analytics(event, userId, meta = {}) { console.log(`[ANALYTICS] ${event}`, { userId, ...meta }); }
  static request(req, res, responseTime) {
    const msg = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${responseTime}ms`;
    if (res.statusCode >= 500) this.error(`API Error: ${msg}`);
    else if (res.statusCode >= 400) this.warn(`API Warning: ${msg}`);
    else this.info(`API Request: ${msg}`);
  }
  static query(operation, collection, duration, meta = {}) {
    const msg = `DB Query: ${operation} ${collection} (${duration}ms)`;
    if (duration > 500) this.warn(msg, meta);
    else this.info(msg, meta);
  }
}

export const createAuditLog = async (actor, action, details = {}, target = null, req = null) => {
  try {
    await AuditLog.create({
      actor: actor._id || actor,
      actorEmail: actor.email,
      action,
      details,
      target: target?._id || target,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
      timestamp: new Date()
    });
  } catch (e) { console.error("Audit log failed", e.message); }
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
export const safeParseInt = (v, d = 0) => isNaN(parseInt(v)) ? d : parseInt(v);
export const safeParseFloat = (v, d = 0) => isNaN(parseFloat(v)) ? d : parseFloat(v);
export const safeParseJSON = (s, d = null) => { try { return JSON.parse(s); } catch { return d; } };
export const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const parseArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean);
  try {
    const p = JSON.parse(val);
    if (Array.isArray(p)) return p.map(v => String(v).trim()).filter(Boolean);
  } catch {}
  return String(val).split(",").map(v => v.trim()).filter(Boolean);
};

/* -------------------------------------------------------------------------- */
/*                              CLOUDINARY UTILITY                            */
/* -------------------------------------------------------------------------- */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: options.folder || "sello_uploads", quality: options.quality || 80, fetch_format: "auto" },
      (err, res) => err ? reject(err) : resolve(res.secure_url)
    );
    stream.end(fileBuffer);
  });
};

/* -------------------------------------------------------------------------- */
/*                                EMAIL UTILITY                               */
/* -------------------------------------------------------------------------- */

export const sendEmail = async (to, subject, html) => {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS === "false") return { actuallySent: false };
  const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.HOST,
    port: EMAIL_CONFIG.PORT,
    secure: EMAIL_CONFIG.PORT === 465,
    auth: { user: EMAIL_CONFIG.MAIL, pass: EMAIL_CONFIG.PASSWORD }
  });
  try {
    const info = await transporter.sendMail({ from: EMAIL_CONFIG.MAIL, to, subject, html });
    return { actuallySent: true, messageId: info.messageId };
  } catch (e) {
    Logger.error("Email failed", e);
    throw e;
  }
};

/* -------------------------------------------------------------------------- */
/*                                PHONE UTILITY                               */
/* -------------------------------------------------------------------------- */

export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

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

  // 1. Keyword search (Across title, make, model, description)
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [
      { title: regex },
      { make: regex },
      { model: regex },
      { description: regex },
    ];
  }

  // 2. Exact match fields
  const exactMatchFields = [
    "make",
    "model",
    "condition",
    "transmission",
    "fuelType",
    "city",
    "vehicleType",
    "bodyType",
    "regionalSpec",
    "ownerType",
    "warranty",
  ];

  exactMatchFields.forEach((field) => {
    if (query[field]) {
      // Use case-insensitive exact match for robustness
      filter[field] = { $regex: new RegExp(`^${query[field]}$`, "i") };
    }
  });

  // 3. Numeric range fields
  const rangeFields = [
    { key: "price", min: "priceMin", max: "priceMax" },
    { key: "year", min: "yearMin", max: "yearMax" },
    { key: "mileage", min: "mileageMin", max: "mileageMax" },
    { key: "horsepower", min: "hpMin", max: "hpMax" },
    { key: "engineCapacity", min: "engineMin", max: "engineMax" },
    { key: "carDoors", min: "doorsMin", max: "doorsMax" },
    { key: "numberOfCylinders", min: "cylMin", max: "cylMax" },
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

  return { filter };
};

export default { Logger, createAuditLog, getAuditLogs, isValidObjectId, safeParseInt, parseArray, uploadCloudinary, sendEmail, generateOtp, trackEvent, buildCarQuery };
