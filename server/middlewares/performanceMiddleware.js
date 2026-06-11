/**
 * Performance Monitoring Middleware
 * Tracks response times and database query performance
 * Enhanced with request ID tracking and detailed metrics
 */

import Logger from "../utils/logger.js";

/**
 * Request performance monitoring
 * Only intercepts res.end (Express calls it from send/json internally)
 */
export const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const requestId = req.id || req.requestId || "unknown";

  // Intercept res.end to set response-time header before response is sent
  const originalEnd = res.end;
  res.end = function (...args) {
    if (!res.headersSent) {
      const responseTime = Date.now() - startTime;
      res.setHeader("X-Response-Time", `${responseTime}ms`);
    }
    return originalEnd.apply(this, args);
  };

  // Track response time for logging (after response is sent)
  res.on("finish", () => {
    const responseTime = Date.now() - startTime;

    // Skip logging for fast requests in production
    if (responseTime < 2000) return;

    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
      userId: req.user?._id?.toString(),
    };

    if (responseTime > 5000) {
      Logger.error("Very Slow API Response", null, {
        ...logData,
        threshold: "5000ms",
      });
    } else {
      Logger.warn("Slow API Response", {
        ...logData,
        threshold: "2000ms",
      });
    }
  });

  next();
};

/**
 * Database query monitoring wrapper
 */
export const monitorQuery = async (operation, collection, queryFn) => {
  const startTime = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    Logger.query(operation, collection, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    Logger.query(operation, collection, duration, { error: error.message });
    throw error;
  }
};
