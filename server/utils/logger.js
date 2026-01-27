/**
 * Centralized Logging Utility
 * Provides structured logging for errors, warnings, and info
 * Integrates with Sentry for error tracking
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Initialize Sentry if DSN is provided
let Sentry = null;
if (process.env.SENTRY_DSN) {
  try {
    import("@sentry/node")
      .then((sentryModule) => {
        Sentry = sentryModule;
        Sentry.init({
          dsn: process.env.SENTRY_DSN,
          environment:
            process.env.SENTRY_ENVIRONMENT ||
            process.env.NODE_ENV ||
            "development",
          tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        });
      })
      .catch(() => {
        // Sentry not installed, continue without it
      });
  } catch (error) {
    // Sentry initialization failed, continue without it
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Get log file path for today
 */
const getLogFile = (type = "app") => {
  const today = new Date().toISOString().split("T")[0];
  return path.join(logsDir, `${type}-${today}.log`);
};

/**
 * Format log message with timestamp and metadata
 */
const formatLog = (level, message, metadata = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...metadata,
  };
  return JSON.stringify(logEntry) + "\n";
};

/**
 * Write to log file
 */
const writeLog = (type, level, message, metadata) => {
  try {
    const logFile = getLogFile(type);
    const logEntry = formatLog(level, message, metadata);
    fs.appendFileSync(logFile, logEntry, "utf8");
  } catch (error) {
    console.error("Failed to write log:", error);
  }
};

/**
 * Logger class
 */
class Logger {
  /**
   * Log error
   */
  static error(message, error = null, metadata = {}) {
    const errorData = {
      ...metadata,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack:
              process.env.NODE_ENV === "development" ? error.stack : undefined,
          }
        : null,
    };

    writeLog("error", "ERROR", message, errorData);
    console.error(`[ERROR] ${message}`, error || "");

    // Send to Sentry if available
    if (Sentry && process.env.SENTRY_DSN) {
      try {
        if (error instanceof Error) {
          Sentry.captureException(error, {
            extra: { message, ...metadata },
            tags: { logger: "server" },
          });
        } else {
          Sentry.captureMessage(message, {
            level: "error",
            extra: { error, ...metadata },
            tags: { logger: "server" },
          });
        }
      } catch (sentryError) {
        // Sentry failed, continue without it
        if (process.env.NODE_ENV === "development") {
          console.warn("Sentry error tracking failed:", sentryError);
        }
      }
    }
  }

  /**
   * Log warning
   */
  static warn(message, metadata = {}) {
    writeLog("app", "WARN", message, metadata);
    console.warn(`[WARN] ${message}`, metadata);
  }

  /**
   * Log info
   */
  static info(message, metadata = {}) {
    writeLog("app", "INFO", message, metadata);
    if (process.env.NODE_ENV === "development") {
      console.log(`[INFO] ${message}`, metadata);
    }
  }

  /**
   * Log debug (only in development)
   */
  static debug(message, metadata = {}) {
    if (process.env.NODE_ENV === "development") {
      writeLog("app", "DEBUG", message, metadata);
      console.debug(`[DEBUG] ${message}`, metadata);
    }
  }

  /**
   * Log API request
   */
  static request(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
      userId: req.user?._id?.toString(),
    };

    if (res.statusCode >= 400) {
      writeLog("error", "ERROR", "API Request Error", logData);
    } else {
      writeLog("app", "INFO", "API Request", logData);
    }
  }

  /**
   * Log database query
   */
  static query(operation, collection, duration, metadata = {}) {
    if (duration > 1000) {
      // Log slow queries
      writeLog("app", "WARN", "Slow Database Query", {
        operation,
        collection,
        duration: `${duration}ms`,
        ...metadata,
      });
    }
  }

  /**
   * Log analytics event
   */
  static analytics(event, userId, metadata = {}) {
    writeLog("analytics", "INFO", event, {
      userId: userId?.toString(),
      ...metadata,
    });
  }

  /**
   * Log security event
   */
  static security(event, metadata = {}) {
    writeLog("security", "WARN", event, metadata);
    console.warn(`[SECURITY] ${event}`, metadata);
  }
}

// Audit Logging Functions
import AuditLog from "../models/auditLogModel.js";

/**
 * Create audit log entry
 */
export const createAuditLog = async (
  actor,
  action,
  details = {},
  target = null,
  req = null,
) => {
  try {
    const auditData = {
      actor: actor._id || actor,
      actorEmail: actor.email || actor.actorEmail,
      action,
      details,
      timestamp: new Date(),
    };

    if (target) {
      auditData.target = target._id || target;
      auditData.targetEmail = target.email || target.targetEmail;
    }

    if (req) {
      auditData.ipAddress =
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress;
      auditData.userAgent = req.headers["user-agent"];
    }

    await AuditLog.create(auditData);
  } catch (error) {
    console.error("Audit Log Error:", error.message);
    // Don't throw error - audit logging should not break the main flow
  }
};

/**
 * Get audit logs with filters
 */
export const getAuditLogs = async (filters = {}, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;
    const logs = await AuditLog.find(filters)
      .populate("actor", "name email")
      .populate("target", "name email")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(filters);

    return {
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Get Audit Logs Error:", error.message);
    throw error;
  }
};

export default Logger;
