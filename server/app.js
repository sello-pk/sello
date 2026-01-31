import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";

import Logger from "./utils/logger.js";
import { performanceMonitor } from "./middlewares/performanceMiddleware.js";
import { checkMaintenanceMode } from "./middlewares/maintenanceModeMiddleware.js";
import { SERVER_CONFIG, SITE_CONFIG } from "./config/index.js";

import {
  notFoundHandler,
  errorHandler,
  validationErrorHandler,
  duplicateKeyErrorHandler,
  castErrorHandler,
} from "./middlewares/errorHandler.js";

dotenv.config();

export const app = express();

/* ---------------------------- SECURITY (HELMET) --------------------------- */
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    crossOriginEmbedderPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
        connectSrc: [
          "'self'",
          "https://accounts.google.com",
          "https://www.googleapis.com",
        ],
      },
    },
  }),
);

/* -------------------------------- COMPRESSION -------------------------------- */
app.use(compression());

/* ------------------------------------ CORS ----------------------------------- */
const allowedOrigins = SERVER_CONFIG.getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        SERVER_CONFIG.NODE_ENV !== "production" &&
        (origin.includes("localhost") || origin.includes("127.0.0.1"))
      )
        return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);

      Logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "email",
    ],
    optionsSuccessStatus: 200,
  }),
);

app.options("*", cors());

/* ---------------------------- BODY PARSERS --------------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

/* ---------------------------- MIDDLEWARES --------------------------- */
import requestIdMiddleware from "./middlewares/requestIdMiddleware.js";
app.use(requestIdMiddleware);
app.use(performanceMonitor);
import { requestTimeout } from "./middlewares/requestTimeout.js";
app.use(requestTimeout(60000)); // 60s timeout
import { sanitizeInput } from "./middlewares/sanitizeMiddleware.js";
app.use(
  sanitizeInput([
    "password",
    "token",
    "email",
    "name",
    "title",
    "description",
    "content",
  ]),
);

/* ---------------------- MAINTENANCE MODE ---------------------- */
app.use(checkMaintenanceMode);

/* ----------------------------- ROUTES ----------------------------- */
/* ----------------------------- ROUTES ----------------------------- */
import apiRoutes from "./routes/index.js";

// API Routes
app.use("/api", apiRoutes);

/* ---------------------- HEALTH CHECK ---------------------- */
app.get("/api/health", (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: SERVER_CONFIG.NODE_ENV,
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  };

  Logger.info("Health check accessed", { health });
  res.status(200).json(health);
});

/* ---------------------- SERVER INFO ---------------------- */
app.get("/", (req, res) => {
  res.json({
    message: `🚀 ${SITE_CONFIG.NAME} API Server`,
    version: "2.0.0",
    environment: SERVER_CONFIG.NODE_ENV,
    documentation: `${req.protocol}://${req.get("host")}/api/health`,
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      cars: "/api/cars",
      users: "/api/users",
      admin: "/api/admin",
    },
  });
});

/* ---------------------- ERROR HANDLERS ---------------------- */
app.use(notFoundHandler);
app.use(validationErrorHandler);
app.use(duplicateKeyErrorHandler);
app.use(castErrorHandler);
app.use(errorHandler);

export default app;
