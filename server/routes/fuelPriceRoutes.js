import express from "express";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { hasAnyPermission } from "../middlewares/permissionMiddleware.js";
import {
  getPublicFuelPrices,
  getAdminFuelPriceDashboard,
  runFuelPriceCheckNow,
  approveOrCorrectFuelPrice,
} from "../controllers/fuelPriceController.js";

const router = express.Router();

router.get("/fuel-prices", getPublicFuelPrices);

router.get(
  "/admin/fuel-prices",
  auth,
  authorize("admin"),
  hasAnyPermission("viewSettings", "managePlatformSettings", "viewAnalytics", "viewAuditLogs"),
  getAdminFuelPriceDashboard
);

router.post(
  "/admin/fuel-prices/run-check",
  auth,
  authorize("admin"),
  hasAnyPermission("managePlatformSettings", "editSettings", "viewSettings"),
  runFuelPriceCheckNow
);

router.post(
  "/admin/fuel-prices/correct",
  auth,
  authorize("admin"),
  hasAnyPermission("managePlatformSettings", "editSettings"),
  approveOrCorrectFuelPrice
);

export default router;
