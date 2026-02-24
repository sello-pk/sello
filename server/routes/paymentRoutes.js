import express from "express";
import { auth, authorize } from "../middlewares/authMiddleware.js";
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
router.get("/admin/wallets", auth, authorize("admin"), adminGetAllWallets);
router.put("/admin/wallet/:userId", auth, authorize("admin"), adminUpdateWalletBalance);
router.get("/admin/deposits", auth, authorize("admin"), adminGetAllDeposits);
router.put("/admin/deposit/:id", auth, authorize("admin"), adminProcessDeposit);
router.get("/admin/refunds", auth, authorize("admin"), adminGetAllRefunds);
router.put("/admin/refund/:id", auth, authorize("admin"), adminProcessRefund);
router.get("/admin/settings", auth, authorize("admin"), adminGetPlatformSettings);
router.put("/admin/settings", auth, authorize("admin"), adminUpdatePlatformSettings);
router.get("/admin/audit-log", auth, authorize("admin"), adminGetAuditLog);

// ── Authenticated User ─────────────────────────────────────────────────────
router.get("/wallet", auth, getMyWallet);
router.post("/deposit", auth, createDeposit);
router.get("/deposits", auth, getMyDeposits);
router.post("/refund-request", auth, createRefundRequest);
router.get("/refund-requests", auth, getMyRefundRequests);

export default router;
