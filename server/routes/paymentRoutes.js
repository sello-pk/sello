import express from "express";
import {
  createSubscriptionCheckout,
  createBoostCheckout,
  stripeWebhook,
  verifyPaymentSession,
} from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create subscription checkout session
router.post("/subscription/checkout", authenticate, createSubscriptionCheckout);

// Create boost checkout session
router.post("/boost/checkout", authenticate, createBoostCheckout);

// Verify payment session status
router.get("/verify/:session_id", authenticate, verifyPaymentSession);

// Stripe webhook endpoint (no authentication required)
router.post("/stripe/webhook", stripeWebhook);

export default router;
