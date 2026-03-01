import express from "express";
import {
  getSubscriptionPlans, getMySubscription, purchaseSubscription, cancelSubscription, getPaymentHistory,
  createSubscriptionCheckout, stripeWebhook, verifyPaymentSession,
  createPromotion, getAllPromotions, getPromotionById, updatePromotion, deletePromotion, getPromotionStats, validatePromoCode, applyPromoCode, getActivePromotions,
  getAllSubscriptionPlans, getActiveSubscriptionPlans, getSubscriptionPlanById, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, toggleSubscriptionPlanStatus
} from "../controllers/billingDomainController.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { hasAnyPermission, hasPermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

/* ------------------------------- STRIPE WEBHOOKS --------------------------- */
// These must be defined before any body-parsing middleware that consumes the raw body
router.post("/billing/webhook/stripe", express.raw({ type: "application/json" }), stripeWebhook);

/* ------------------------------ SUBSCRIPTIONS ----------------------------- */
router.get("/billing/plans", getSubscriptionPlans);
router.get("/billing/my-subscription", auth, getMySubscription);
router.post("/billing/purchase", auth, purchaseSubscription);
router.post("/billing/cancel", auth, cancelSubscription);
router.get("/billing/payment-history", auth, getPaymentHistory);
router.post("/billing/checkout", auth, createSubscriptionCheckout);
router.get("/billing/verify-payment/:sessionId", auth, verifyPaymentSession);

/* ------------------------------- PROMOTIONS ------------------------------- */
router.post("/billing/promotions/validate", validatePromoCode);
router.post("/billing/promotions/apply", applyPromoCode);
router.get("/billing/promotions/active", getActivePromotions);
// Admin
router.post("/billing/promotions", auth, authorize("admin"), hasAnyPermission("createPromotions", "managePromotions"), createPromotion);
router.get("/billing/promotions", auth, authorize("admin"), hasAnyPermission("viewPromotions", "managePromotions"), getAllPromotions);
router.get("/billing/promotions/statistics", auth, authorize("admin"), hasAnyPermission("viewPromotions", "viewAnalytics"), getPromotionStats);
router.put("/billing/promotions/:promotionId", auth, authorize("admin"), hasAnyPermission("editPromotions", "managePromotions"), updatePromotion);
router.get("/billing/promotions/:promotionId", auth, authorize("admin"), hasAnyPermission("viewPromotions", "managePromotions"), getPromotionById);
router.delete("/billing/promotions/:promotionId", auth, authorize("admin"), hasAnyPermission("deletePromotions", "managePromotions"), deletePromotion);

/* --------------------------- SUBSCRIPTION PLANS --------------------------- */
router.get("/billing/subscription-plans/active", getActiveSubscriptionPlans);
// Admin
router.get("/billing/subscription-plans", auth, authorize("admin"), hasAnyPermission("viewFinancialReports", "managePlatformSettings"), getAllSubscriptionPlans);
router.get("/billing/subscription-plans/:planId", auth, authorize("admin"), hasAnyPermission("viewFinancialReports", "managePlatformSettings"), getSubscriptionPlanById);
router.post("/billing/subscription-plans", auth, authorize("admin"), hasAnyPermission("managePlatformSettings", "manageCommission"), createSubscriptionPlan);
router.put("/billing/subscription-plans/:planId", auth, authorize("admin"), hasAnyPermission("managePlatformSettings", "manageCommission"), updateSubscriptionPlan);
router.delete("/billing/subscription-plans/:planId", auth, authorize("admin"), hasAnyPermission("managePlatformSettings", "manageCommission"), deleteSubscriptionPlan);
router.patch("/billing/subscription-plans/:planId/toggle", auth, authorize("admin"), hasAnyPermission("managePlatformSettings", "manageCommission"), toggleSubscriptionPlanStatus);

// Admin Payment & Subscription Management
import { getAllPayments, getAllSubscriptions, adminUpdateSubscription } from "../controllers/billingDomainController.js";
router.get(
  "/billing/admin/payments",
  auth,
  authorize("admin"),
  hasAnyPermission("viewFinancialReports", "managePayments"),
  getAllPayments,
);
router.get(
  "/billing/admin/subscriptions",
  auth,
  authorize("admin"),
  hasAnyPermission("viewFinancialReports", "managePayments"),
  getAllSubscriptions,
);
router.put(
  "/billing/admin/subscriptions/:userId",
  auth,
  authorize("admin"),
  hasAnyPermission("manageCommission", "managePayments"),
  adminUpdateSubscription,
);

export default router;
