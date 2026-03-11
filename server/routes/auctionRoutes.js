import express from "express";
import {
  auth,
  authorize,
  requireAuctionBidAccess,
} from "../middlewares/authMiddleware.js";
import { hasAnyPermission } from "../middlewares/permissionMiddleware.js";
import { upload } from "../middlewares/multer.js";
import {
  getAuctions,
  getAuctionById,
  getLiveAuction,
  getAuctionCars,
  getAuctionCarDetail,
  placeBid,
  setProxyBid,
  placeOfflineBid,
  getBidsForCar,
  submitTokenPayment,
  getMyTokenPayments,
  addToWatchlist,
  removeFromWatchlist,
  getMyWatchlist,
  getMyWonAuctions,
  getMyEscrows,
  getMyAuctionResult,
  submitCarToAuction,
  createAuction,
  updateAuction,
  goLive,
  endAuction,
  cancelAuction,
  approveAuctionCar,
  rejectAuctionCar,
  updateInspection,
  getAllTokenPayments,
  verifyTokenPayment,
  getAuctionDashboard,
  getAllAuctionCars,
  getMyBids,
  adminAddCarToAuction,
  adminUpdateEscrowStatus,
  adminGetAllEscrows,
  adminRefundToken,
  adminBulkRefundTokens,
  getPaymentStats,
  getMyWalletTransactions,
} from "../controllers/auctionController.js";

const router = express.Router();

// ── Admin (must come before /:id to avoid param collision) ──────────────────
router.post(
  "/admin/create",
  auth,
  authorize("admin"),
  hasAnyPermission("manageAuctions", "manageListings"),
  createAuction,
);
router.get(
  "/admin/dashboard",
  auth,
  authorize("admin"),
  hasAnyPermission("viewAuctions", "viewAnalytics"),
  getAuctionDashboard,
);
router.get(
  "/admin/cars",
  auth,
  authorize("admin"),
  hasAnyPermission("viewAuctions", "viewListings"),
  getAllAuctionCars,
);
router.get(
  "/admin/token-payments",
  auth,
  authorize("admin"),
  hasAnyPermission("viewFinancialReports", "managePayments"),
  getAllTokenPayments,
);
router.put(
  "/admin/token-payments/:id",
  auth,
  authorize("admin"),
  hasAnyPermission("managePayments", "manageCommission"),
  verifyTokenPayment,
);
router.put(
  "/admin/car/:id/approve",
  auth,
  authorize("admin"),
  hasAnyPermission("manageAuctions", "approveListings"),
  approveAuctionCar,
);
router.put(
  "/admin/car/:id/reject",
  auth,
  authorize("admin"),
  hasAnyPermission("manageAuctions", "approveListings"),
  rejectAuctionCar,
);
router.put(
  "/admin/car/:id/inspection",
  auth,
  authorize("admin"),
  hasAnyPermission("manageAuctions", "editListings"),
  updateInspection,
);
router.post(
  "/admin/offline-bid",
  auth,
  authorize("admin"),
  hasAnyPermission("manageAuctions", "managePayments"),
  placeOfflineBid,
);
router.post(
  "/admin/add-car",
  auth,
  authorize("admin"),
  hasAnyPermission("manageAuctions", "manageListings"),
  adminAddCarToAuction,
);
router.get(
  "/admin/escrows",
  auth,
  authorize("admin"),
  hasAnyPermission("viewFinancialReports", "managePayments"),
  adminGetAllEscrows,
);
router.put(
  "/admin/escrow/:id",
  auth,
  authorize("admin"),
  hasAnyPermission("managePayments", "manageCommission"),
  adminUpdateEscrowStatus,
);
router.put(
  "/admin/token-refund/:id",
  auth,
  authorize("admin"),
  hasAnyPermission("managePayments", "manageCommission"),
  adminRefundToken,
);
router.post(
  "/admin/bulk-refund",
  auth,
  authorize("admin"),
  hasAnyPermission("managePayments", "manageCommission"),
  adminBulkRefundTokens,
);
router.get(
  "/admin/payment-stats",
  auth,
  authorize("admin"),
  hasAnyPermission("viewFinancialReports", "viewAnalytics"),
  getPaymentStats,
);
router.put(
  "/admin/:id/go-live",
  auth,
  authorize("admin"),
  hasAnyPermission("manageAuctions", "manageListings"),
  goLive,
);
router.put(
  "/admin/:id/end",
  auth,
  authorize("admin"),
  hasAnyPermission("manageAuctions", "manageListings"),
  endAuction,
);
router.put(
  "/admin/:id/cancel",
  auth,
  authorize("admin"),
  hasAnyPermission("manageAuctions", "manageListings"),
  cancelAuction,
);
router.put(
  "/admin/:id",
  auth,
  authorize("admin"),
  hasAnyPermission("manageAuctions", "manageListings"),
  updateAuction,
);

// ── Authenticated User ─────────────────────────────────────────────────────
router.post("/bid", auth, requireAuctionBidAccess, placeBid);
router.post("/proxy-bid", auth, requireAuctionBidAccess, setProxyBid);
router.post("/token-payment", auth, submitTokenPayment);
router.get("/my/token-payments", auth, getMyTokenPayments);
router.post("/watchlist", auth, addToWatchlist);
router.delete("/watchlist/:auctionCarId", auth, removeFromWatchlist);
router.get("/my/watchlist", auth, getMyWatchlist);
router.get("/my/bids", auth, getMyBids);
router.get("/my/won", auth, getMyWonAuctions);
router.get("/my/escrows", auth, getMyEscrows);
router.get("/my/result/:auctionCarId", auth, getMyAuctionResult);
router.get("/my/transactions", auth, getMyWalletTransactions);
router.post("/submit-car", auth, upload.fields([{ name: 'images', maxCount: 15 }]), submitCarToAuction);

// ── Public (specific routes first, then parameterized) ─────────────────────
router.get("/live", getLiveAuction);
router.get("/car/:id", getAuctionCarDetail);
router.get("/car/:auctionCarId/bids", getBidsForCar);
router.get("/", getAuctions);
router.get("/:auctionId/cars", getAuctionCars);
router.get("/:id", getAuctionById);

export default router;
