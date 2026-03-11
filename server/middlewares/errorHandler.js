/**
 * Global Error Handler Middleware
 * Handles all errors in a centralized way
 */

import Logger from "../utils/logger.js";
import {
  LISTING_MAX_IMAGES,
  MSG_IMAGE_FILE_TOO_LARGE,
  MSG_IMAGE_TOO_MANY,
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

/** Global error handler – must never throw so the app never crashes */
export const errorHandler = (err, req, res, next) => {
  try {
    if (res.headersSent) {
      Logger.error("Error Handler - Response already sent", err, { method: req?.method, url: req?.originalUrl || req?.url });
      return;
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

    if (code === "LIMIT_FILE_SIZE") {
      message = MSG_IMAGE_FILE_TOO_LARGE;
    } else if (
      code === "LIMIT_FILE_COUNT" ||
      code === "LIMIT_UNEXPECTED_FILE"
    ) {
      message = MSG_IMAGE_TOO_MANY;
    } else if (code === "LIMIT_PART_COUNT") {
      message =
        "Upload request is too large. Reduce the number or size of images and try again.";
    } else if (
      err.message &&
      (err.message.includes("Only images") ||
        err.message.includes("Invalid file type"))
    ) {
      message = err.message;
    } else {
      message = `Image upload failed. Use JPG, PNG, or WebP only — up to ${LISTING_MAX_IMAGES} images and 35MB total per listing.`;
    }

    Logger.warn("Multer upload error", { code, message, url: req?.originalUrl });
    return res.status(statusCode).json({ success: false, message });
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
