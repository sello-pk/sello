import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";
import path from "path"; // Added for safe path resolving
import fs from "node:fs"; // For detecting the built client (single-service mode)
import { fileURLToPath } from "node:url"; // Resolves server dir regardless of cwd

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
import feedRoutes from "./routes/feedRoutes.js";
import requestIdMiddleware from "./middlewares/requestIdMiddleware.js";
import { requestTimeout } from "./middlewares/requestTimeout.js";
import { sanitizeInput } from "./middlewares/sanitizeMiddleware.js";
import { apiLimiter } from "./middlewares/securityMiddleware.js";

dotenv.config();

export const app = express();

/* ------------------------ SINGLE-SERVICE CLIENT (STATIC) ------------------------ */
// When the built React client exists (../client/dist), Express serves it on the
// same origin as the API so the whole app runs as one Render Web Service.
// Path is resolved from THIS file, not process.cwd(), so it works no matter how
// the process is launched (Render, PM2, foreground, etc.).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../client/dist");
const clientIndex = path.join(clientDist, "index.html");
const servesClient = fs.existsSync(clientIndex);

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
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://accounts.google.com",
          "https://apis.google.com",
          "https://connect.facebook.net",
          "https://www.facebook.com",
          "https://cdn.tiny.cloud",
          "https://*.tiny.cloud",
        ],
        connectSrc: [
          "'self'",
          "https://api.sello.pk",
          "https://www.sello.pk",
          "https://sello.pk",
          "https://accounts.google.com",
          "https://www.googleapis.com",
          "https://*.gstatic.com",
          "https://connect.facebook.net",
          "https://www.facebook.com",
          "wss://api.sello.pk",
          "wss://localhost:4002",
          "ws://localhost:4002",
          "http://localhost:4002",
          "https://localhost:4002",
        ],
        frameSrc: [
          "'self'",
          "https://*.tiny.cloud",
          "https://cdn.tiny.cloud",
          "https://accounts.google.com",
          "https://*.google.com",
          "https://www.facebook.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.tiny.cloud",
          "https://*.tiny.cloud",
          "https://accounts.google.com",
        ],
        fontSrc: [
          "'self'",
          "data:",
          "https://fonts.gstatic.com",
          "https://cdn.tiny.cloud",
          "https://*.tiny.cloud",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "http:",
          "https://res.cloudinary.com",
          "https://*.cloudinary.com",
          "https://api.sello.pk",
        ],
        workerSrc: [
          "'self'",
          "blob:",
          "https://cdn.tiny.cloud",
          "https://*.tiny.cloud",
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
app.use(feedRoutes);
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

app.get("/", (req, res, next) => {
  // In single-service mode the built client answers the root route.
  if (servesClient) return next();
  res.json({
    message: `🚀 ${SITE_CONFIG.NAME} API Server`,
    version: "2.0.0",
    environment: SERVER_CONFIG.NODE_ENV,
  });
});

/* ------------------ SINGLE-SERVICE STATIC + SPA FALLBACK ------------------ */
if (servesClient) {
  Logger.info(`Serving built client from ${clientDist}`);
  app.use(express.static(clientDist));
  // SPA fallback: every non-API GET returns the app shell.
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(clientIndex);
  });
} else {
  Logger.info("Client build not found at ../client/dist — running API-only mode");
}

/* ---------------------- ERROR HANDLERS ---------------------- */
app.use(notFoundHandler);
app.use(validationErrorHandler);
app.use(duplicateKeyErrorHandler);
app.use(castErrorHandler);
app.use(multerErrorHandler);
app.use(errorHandler);

export default app;
