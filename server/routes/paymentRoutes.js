import express from "express";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { hasAnyPermission, hasPermission } from "../middlewares/permissionMiddleware.js";
import {
  getMyWallet,
  createDeposit,
  getMyDeposits,
  createRefundRequest,
  getMyRefundRequests,
  adminGetAllWallets,
  adminUpdateWalletBalance,
  adminGetAllDeposits,
  adminProcessDeposit,
  adminGetAllRefunds,
  adminProcessRefund,
  adminGetPlatformSettings,
  adminUpdatePlatformSettings,
  adminGetAuditLog,
} from "../controllers/paymentController.js";

const router = express.Router();

// ── Admin (prefix routes first) ─────────────────────────────────────────────
router.get(
  "/admin/wallets",
  auth,
  authorize("admin"),
  hasAnyPermission("viewFinancialReports", "managePayments"),
  adminGetAllWallets,
);
router.put(
  "/admin/wallet/:userId",
  auth,
  authorize("admin"),
  hasAnyPermission("manageCommission", "managePayments"),
  adminUpdateWalletBalance,
);
router.get(
  "/admin/deposits",
  auth,
  authorize("admin"),
  hasAnyPermission("viewFinancialReports", "managePayments"),
  adminGetAllDeposits,
);
router.put(
  "/admin/deposit/:id",
  auth,
  authorize("admin"),
  hasAnyPermission("managePayments", "manageCommission"),
  adminProcessDeposit,
);
router.get(
  "/admin/refunds",
  auth,
  authorize("admin"),
  hasAnyPermission("viewFinancialReports", "managePayments"),
  adminGetAllRefunds,
);
router.put(
  "/admin/refund/:id",
  auth,
  authorize("admin"),
  hasAnyPermission("managePayments", "manageCommission"),
  adminProcessRefund,
);
router.get(
  "/admin/settings",
  auth,
  authorize("admin"),
  hasPermission("accessSensitiveAreas"),
  adminGetPlatformSettings,
);
router.put(
  "/admin/settings",
  auth,
  authorize("admin"),
  hasPermission("accessSensitiveAreas"),
  adminUpdatePlatformSettings,
);
router.get(
  "/admin/audit-log",
  auth,
  authorize("admin"),
  hasAnyPermission("viewAuditLogs", "viewFinancialReports"),
  adminGetAuditLog,
);

// ── Authenticated User ─────────────────────────────────────────────────────
router.get("/wallet", auth, getMyWallet);
router.post("/deposit", auth, createDeposit);
router.get("/deposits", auth, getMyDeposits);
router.post("/refund-request", auth, createRefundRequest);
router.get("/refund-requests", auth, getMyRefundRequests);

export default router;
