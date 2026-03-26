/**
 * Global Error Handler Middleware
 * Handles all errors in a centralized way
 */

import Logger from "../utils/logger.js";
import {
  LISTING_MAX_IMAGES,
  MSG_IMAGE_FILE_TOO_LARGE,
  MSG_IMAGE_TOO_MANY,
  UPLOAD_PROXY_MIN_BODY_MB,
} from "../constants/listingUpload.js";

/**
 * Custom Error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

const GENERIC_MESSAGE = "Something went wrong. Please try again later.";

const isDealerUploadRoute = (url = "") =>
  url.includes("/auth/register") ||
  url.includes("/users/dealer-profile") ||
  url.includes("/users/auction-access/request") ||
  url.includes("/users/request-dealer");

const isAuctionSubmitRoute = (url = "") => url.includes("/auctions/submit-car");

/** Global error handler – must never throw so the app never crashes */
export const errorHandler = (err, req, res, next) => {
  try {
    if (res.headersSent) {
      Logger.error("Error Handler - Response already sent", err, { method: req?.method, url: req?.originalUrl || req?.url });
      return;
    }

    if (
      err?.type === "entity.too.large" ||
      err?.status === 413 ||
      err?.statusCode === 413
    ) {
      Logger.warn("Payload too large", {
        method: req?.method,
        url: req?.originalUrl || req?.url,
      });
      return res.status(413).json({
        success: false,
        message: "Upload is too large for the server to accept right now.",
      });
    }

    if (err?.code === "ECONNRESET" || err?.code === "ETIMEDOUT") {
      Logger.error("Upstream connection error", {
        code: err.code,
        method: req?.method,
        url: req?.originalUrl || req?.url,
      });
      return res.status(503).json({
        success: false,
        message: "Upload service is temporarily unavailable. Please try again.",
      });
    }

    const statusCode = err?.statusCode || 500;
    const isOperational = err?.isOperational !== false;
    if (statusCode >= 500) {
      Logger.error("Server Error", err, { method: req?.method, url: req?.originalUrl || req?.url, ip: req?.ip });
    } else {
      Logger.warn("Client Error", { message: err?.message, statusCode, method: req?.method, url: req?.originalUrl || req?.url });
    }
    const isProd = process.env.NODE_ENV === "production";
    let message = err?.message || GENERIC_MESSAGE;
    if (isProd && statusCode === 500 && !isOperational) message = GENERIC_MESSAGE;
    if (isProd && statusCode === 404) message = "Not found.";
    if (isProd && err?.name === "CastError") message = "Invalid request.";
    res.status(statusCode).json({
      success: false,
      message,
      ...(statusCode === 400 && err?.errors ? { errors: err.errors } : {}),
    });
  } catch (handlerError) {
    Logger.error("Error handler threw", handlerError);
    if (!res.headersSent) res.status(500).json({ success: false, message: GENERIC_MESSAGE });
  }
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(err);
};

/**
 * Handle async errors
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle validation errors – user-friendly message
 */
export const validationErrorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Please check the form and try again.",
      errors,
    });
  }
  next(err);
};

/**
 * Handle MongoDB duplicate key errors
 */
export const duplicateKeyErrorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "This already exists. Please use a different value.",
    });
  }
  next(err);
};

/**
 * Multer upload errors – image count / file size / type (listing photos)
 * Must run before generic errorHandler so users get actionable messages.
 */
export const multerErrorHandler = (err, req, res, next) => {
  if (!err) return next();
  const isProd = process.env.NODE_ENV === "production";
  const url = req?.originalUrl || req?.url || "";
  const isDealerUpload = isDealerUploadRoute(url);
  const isAuctionUpload = isAuctionSubmitRoute(url);

  const code = err.code;
  const isMulter =
    err.name === "MulterError" ||
    code === "LIMIT_FILE_SIZE" ||
    code === "LIMIT_FILE_COUNT" ||
    code === "LIMIT_UNEXPECTED_FILE" ||
    code === "LIMIT_PART_COUNT" ||
    code === "LIMIT_FIELD_KEY" ||
    code === "LIMIT_FIELD_VALUE" ||
    code === "LIMIT_FIELD_COUNT";

  if (isMulter) {
    if (res.headersSent) return next(err);
    let message;
    let statusCode = 400;
    let errorType = "upload_error";
    let details = null;

    if (code === "LIMIT_FILE_SIZE") {
      errorType = "file_size";
      if (isDealerUpload) {
        message =
          "Dealer document is too large. Please upload a PDF or image under 10MB.";
        details = "Maximum file size: 10MB for dealer documents";
      } else if (isAuctionUpload) {
        message = MSG_IMAGE_FILE_TOO_LARGE;
        details = "Each image can be up to 35MB, but all images together must stay within 35MB total";
      } else {
        message =
          "The uploaded file is too large. Please use a smaller file and try again.";
        details = "Check file size limits for this upload type";
      }
    } else if (
      code === "LIMIT_FILE_COUNT" ||
      code === "LIMIT_UNEXPECTED_FILE"
    ) {
      errorType = "file_count";
      if (isDealerUpload && code === "LIMIT_UNEXPECTED_FILE") {
        message =
          "The uploaded dealer document field was not recognized. Please retry from the latest form.";
        details = "Allowed fields: avatar, businessLicense, showroomImages";
      } else if (isAuctionUpload && code === "LIMIT_UNEXPECTED_FILE") {
        const badField = typeof err.field === "string" ? err.field : "unknown";
        errorType = "unexpected_field";
        message = `Unexpected upload field: ${badField}.`;
        details =
          "Allowed auction upload fields: images, inspectionReport, inspectionReportFile, damageImages, documents";
      } else if (isDealerUpload) {
        message =
          "Too many dealer files were uploaded. Please attach only the required document(s) and try again.";
        details = "Maximum files: 1 avatar, 1 license, 10 showroom images";
      } else {
        message = MSG_IMAGE_TOO_MANY;
        details = `Maximum ${LISTING_MAX_IMAGES} images per listing`;
      }
    } else if (code === "LIMIT_PART_COUNT") {
      errorType = "request_size";
      if (isDealerUpload) {
        message = isProd
          ? "Dealer upload is too large for the server right now. Please use a smaller file and try again."
          : `Dealer upload request is too large. If using a reverse proxy (e.g. nginx), set body limit to at least ${UPLOAD_PROXY_MIN_BODY_MB}MB (client_max_body_size ${UPLOAD_PROXY_MIN_BODY_MB}m) and reload.`;
        details = `Required minimum: ${UPLOAD_PROXY_MIN_BODY_MB}MB body size`;
      } else {
        message = isProd 
          ? `Your upload is too large. You can upload up to ${LISTING_MAX_IMAGES} images with a total size of 35MB. Please try compressing your images or uploading fewer files.`
          : `Upload request is too large. Allowed: up to ${LISTING_MAX_IMAGES} images, 35MB total. If using a reverse proxy (e.g. nginx), set body limit to at least ${UPLOAD_PROXY_MIN_BODY_MB}MB (client_max_body_size ${UPLOAD_PROXY_MIN_BODY_MB}m) and reload.`;
        details = `Allowed: ${LISTING_MAX_IMAGES} images, 35MB total`;
      }
    } else if (
      err.message &&
      (err.message.includes("Only images") ||
        err.message.includes("Invalid file type"))
    ) {
      errorType = "file_type";
      if (isDealerUpload) {
        message =
          "Dealer documents must be PDF, JPG, PNG, or WebP files only.";
        details = "Allowed types: PDF, JPG, PNG, WebP";
      } else {
        message = err.message;
        details = "Allowed types: JPG, PNG, WebP";
      }
    } else {
      errorType = "unknown_upload";
      if (isDealerUpload) {
        message = isProd
          ? "Dealer document upload failed. Please use a valid PDF or image file and try again."
          : `Dealer document upload failed. Use PDF, JPG, PNG, or WebP. If this still fails in production, set proxy body limit to at least ${UPLOAD_PROXY_MIN_BODY_MB}MB (e.g. nginx: client_max_body_size ${UPLOAD_PROXY_MIN_BODY_MB}m).`;
        details = "Check file format and size requirements";
      } else {
        message = isProd
          ? `Image upload failed. Please use JPG, PNG, or WebP files only. You can upload up to ${LISTING_MAX_IMAGES} images with a total size of 35MB.`
          : `Image upload failed. Use JPG, PNG, or WebP only — up to ${LISTING_MAX_IMAGES} images and 35MB total per listing. If upload fails after a few images, set proxy body limit to at least ${UPLOAD_PROXY_MIN_BODY_MB}MB (e.g. nginx: client_max_body_size ${UPLOAD_PROXY_MIN_BODY_MB}m).`;
        details = `Requirements: JPG/PNG/WebP, ${LISTING_MAX_IMAGES} images max, 35MB total`;
      }
    }

    Logger.warn("Multer upload error", { 
      code, 
      message, 
      url: req?.originalUrl,
      errorType,
      details
    });
    
    return res.status(statusCode).json({ 
      success: false, 
      message,
      errorType,
      details,
      ...(isProd ? {} : { multerCode: code })
    });
  }

  next(err);
};

/**
 * Handle MongoDB cast errors (invalid ObjectId) – user-friendly
 */
export const castErrorHandler = (err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid request. Please try again.",
    });
  }
  next(err);
};
