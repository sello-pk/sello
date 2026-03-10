/**
 * Global Error Handler Middleware
 * Handles all errors in a centralized way
 */

import Logger from "../utils/logger.js";

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
