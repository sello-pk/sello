import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";
import path from "path"; // Added for safe path resolving

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
  multerErrorHandler,
} from "./middlewares/errorHandler.js";

// Routes
import apiRoutes from "./routes/index.js";
import requestIdMiddleware from "./middlewares/requestIdMiddleware.js";
import { requestTimeout } from "./middlewares/requestTimeout.js";
import { sanitizeInput } from "./middlewares/sanitizeMiddleware.js";
import { apiLimiter } from "./middlewares/securityMiddleware.js";

dotenv.config();

export const app = express();

/* ---------------------------- SECURITY (HELMET) --------------------------- */
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    crossOriginEmbedderPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [
          "'self'",
          "https:",
          "http:",
          "data:",
          "blob:",
          "'unsafe-inline'",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://accounts.google.com",
          "https://apis.google.com",
        ],
        connectSrc: [
          "'self'",
          "https://api.sello.pk",
          "https://www.sello.pk",
          "https://sello.pk",
          "https://accounts.google.com",
          "https://www.googleapis.com",
          "https://*.gstatic.com", // Added for Google Auth/Maps stability
          "http://localhost:4002",
          "https://localhost:4002",
          "ws://localhost:4002",
          "wss://localhost:4002",
        ],
      },
    },
  }),
);

/* -------------------------------- CORE MIDDLEWARE ---------------------------- */
app.use(compression());
app.use(requestIdMiddleware);
app.use(requestTimeout(60000)); // 60s
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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

/* ---------------------------- STATIC ASSETS --------------------------- */
// This serves as a backup to NGINX.
// Ensure the path correctly points to your build folder.
app.use(
  "/assets",
  express.static(path.join(process.cwd(), "build/assets"), {
    maxAge: "1y",
    immutable: true,
    index: false,
  }),
);

/* ---------------------------- BUSINESS LOGIC --------------------------- */
app.use(performanceMonitor);
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
app.use(checkMaintenanceMode);

/* ----------------------------- ROUTES ----------------------------- */
app.use("/api", apiLimiter, apiRoutes);

/* ---------------------- HEALTH & INFO ---------------------- */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    uptime: process.uptime(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: `🚀 ${SITE_CONFIG.NAME} API Server`,
    version: "2.0.0",
    environment: SERVER_CONFIG.NODE_ENV,
  });
});

/* ---------------------- ERROR HANDLERS ---------------------- */
app.use(notFoundHandler);
app.use(validationErrorHandler);
app.use(duplicateKeyErrorHandler);
app.use(castErrorHandler);
app.use(multerErrorHandler);
app.use(errorHandler);

export default app;
