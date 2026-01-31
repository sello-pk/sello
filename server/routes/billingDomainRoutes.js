import express from "express";
import {
  getSubscriptionPlans, getMySubscription, purchaseSubscription, cancelSubscription, getPaymentHistory,
  createSubscriptionCheckout, stripeWebhook, verifyPaymentSession,
  createPromotion, getAllPromotions, getPromotionById, updatePromotion, deletePromotion, getPromotionStats, validatePromoCode, applyPromoCode, getActivePromotions,
  getAllSubscriptionPlans, getActiveSubscriptionPlans, getSubscriptionPlanById, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, toggleSubscriptionPlanStatus
} from "../controllers/billingDomainController.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { hasPermission } from "../middlewares/permissionMiddleware.js";

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
router.post("/billing/promotions", auth, authorize("admin"), hasPermission("createPromotions"), createPromotion);
router.get("/billing/promotions", auth, authorize("admin"), hasPermission("viewPromotions"), getAllPromotions);
router.get("/billing/promotions/statistics", auth, authorize("admin"), hasPermission("viewPromotions"), getPromotionStats);
router.delete("/billing/promotions/:promotionId", auth, authorize("admin"), hasPermission("deletePromotions"), deletePromotion);

/* --------------------------- SUBSCRIPTION PLANS --------------------------- */
router.get("/billing/subscription-plans/active", getActiveSubscriptionPlans);
// Admin
router.get("/billing/subscription-plans", auth, authorize("admin"), getAllSubscriptionPlans);
router.get("/billing/subscription-plans/:planId", auth, authorize("admin"), getSubscriptionPlanById);
router.post("/billing/subscription-plans", auth, authorize("admin"), createSubscriptionPlan);
router.put("/billing/subscription-plans/:planId", auth, authorize("admin"), updateSubscriptionPlan);
router.patch("/billing/subscription-plans/:planId/toggle", auth, authorize("admin"), toggleSubscriptionPlanStatus);

// Admin Payment & Subscription Management
import { getAllPayments, getAllSubscriptions, adminUpdateSubscription } from "../controllers/billingDomainController.js";
router.get("/billing/admin/payments", auth, authorize("admin"), getAllPayments);
router.get("/billing/admin/subscriptions", auth, authorize("admin"), getAllSubscriptions);
router.put("/billing/admin/subscriptions/:userId", auth, authorize("admin"), adminUpdateSubscription);

export default router;
