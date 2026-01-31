import Stripe from "stripe";
import User from "../models/userModel.js";
import SubscriptionPlan from "../models/subscriptionPlanModel.js";
import ProcessedWebhook from "../models/processedWebhookModel.js";
import Promotion from "../models/promotionModel.js";
import Notification from "../models/notificationModel.js";
import Settings from "../models/settingsModel.js";
import { Logger, sendEmail } from "../utils/helpers.js";
import { EMAIL_CONFIG } from "../config/index.js";
import mongoose from "mongoose";

// Legacy hardcoded plans (fallback)
export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    duration: 0,
    features: ["Unlimited listings", "Standard support"],
    maxListings: -1,
    boostCredits: 0,
  },
  basic: {
    name: "Basic",
    price: 29.99,
    duration: 30,
    features: ["Unlimited listings", "Priority support", "5 boost credits/month", "Featured listing badge"],
    maxListings: -1,
    boostCredits: 5,
  },
  premium: {
    name: "Premium",
    price: 59.99,
    duration: 30,
    features: ["Unlimited listings", "Priority support", "20 boost credits/month", "Featured listing badge", "Analytics dashboard", "Advanced search filters"],
    maxListings: -1,
    boostCredits: 20,
  },
  dealer: {
    name: "Dealer",
    price: 149.99,
    duration: 30,
    features: ["Unlimited listings", "24/7 priority support", "50 boost credits/month", "Featured listing badge", "Analytics dashboard", "Advanced search filters", "Dealer verification badge", "Bulk listing tools"],
    maxListings: -1,
    boostCredits: 50,
  },
};

// Initialize Stripe
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" });
  } catch (error) { Logger.warn("Stripe init failed:", error.message); }
}

/* -------------------------------------------------------------------------- */
/*                            SUBSCRIPTION SECTION                            */
/* -------------------------------------------------------------------------- */

export const getSubscriptionPlans = async (req, res) => {
  try {
    const paymentEnabled = await Settings.findOne({ key: "paymentSystemEnabled" });
    const isPaymentEnabled = paymentEnabled?.value !== false && paymentEnabled?.value !== "false";
    const showTab = await Settings.findOne({ key: "showSubscriptionTab" });
    const showTabEnabled = showTab?.value !== false && showTab?.value !== "false";

    if (!isPaymentEnabled) {
      return res.status(200).json({ success: true, data: {}, paymentSystemEnabled: false, showSubscriptionTab: showTabEnabled });
    }

    const dbPlans = await SubscriptionPlan.find({ isActive: true, visible: { $ne: false } }).sort({ order: 1 });
    const userRole = req.user?.role || "user";

    const filteredPlans = dbPlans.filter(plan => {
      if (plan.allowedRoles?.length > 0 && !plan.allowedRoles.includes("all") && !plan.allowedRoles.includes(userRole)) return false;
      return true;
    });

    if (filteredPlans.length > 0) {
      const plansObject = {};
      filteredPlans.forEach(plan => {
        plansObject[plan.name] = {
          name: plan.displayName,
          price: plan.price,
          duration: plan.duration,
          features: plan.features,
          maxListings: plan.maxListings,
          boostCredits: plan.boostCredits,
          requiresApproval: plan.requiresApproval || false,
        };
      });
      return res.status(200).json({ success: true, data: plansObject, paymentSystemEnabled: true, showSubscriptionTab: showTabEnabled });
    }

    return res.status(200).json({ success: true, data: SUBSCRIPTION_PLANS, paymentSystemEnabled: true, showSubscriptionTab: showTabEnabled });
  } catch (error) {
    Logger.error("Get Subscription Plans Error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMySubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("subscription boostCredits");
    let planDetails = SUBSCRIPTION_PLANS.free;
    if (user.subscription?.plan) {
      const dbPlan = await SubscriptionPlan.findOne({ name: user.subscription.plan });
      planDetails = dbPlan ? {
        name: dbPlan.displayName, price: dbPlan.price, duration: dbPlan.duration, 
        features: dbPlan.features, maxListings: dbPlan.maxListings, boostCredits: dbPlan.boostCredits
      } : (SUBSCRIPTION_PLANS[user.subscription.plan] || SUBSCRIPTION_PLANS.free);
    }
    return res.status(200).json({ success: true, data: { subscription: user.subscription, boostCredits: user.boostCredits, planDetails } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const purchaseSubscription = async (req, res) => {
    try {
      const { plan, paymentMethod, transactionId, autoRenew } = req.body;
      const selectedPlan = (await SubscriptionPlan.findOne({ name: plan, isActive: true })) || SUBSCRIPTION_PLANS[plan];
      if (!selectedPlan) return res.status(400).json({ success: false, message: "Invalid plan" });

      const user = await User.findById(req.user._id);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (selectedPlan.duration || 30));

      user.subscription = { plan, startDate: new Date(), endDate, isActive: true, autoRenew: !!autoRenew };
      if (selectedPlan.boostCredits > 0) user.boostCredits += selectedPlan.boostCredits;

      user.paymentHistory.push({
        amount: selectedPlan.price, currency: "USD", paymentMethod: paymentMethod || "card",
        transactionId: transactionId || `TXN-${Date.now()}`, purpose: "subscription", status: "completed", createdAt: new Date()
      });
      user.totalSpent += (selectedPlan.price || 0);
      await user.save({ validateBeforeSave: false });

      return res.status(200).json({ success: true, message: "Subscribed successfully", data: { subscription: user.subscription, boostCredits: user.boostCredits } });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.subscription.isActive) return res.status(400).json({ success: false, message: "No active subscription" });
    user.subscription.autoRenew = false;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ success: true, message: "Auto-renew cancelled" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("paymentHistory totalSpent");
    return res.status(200).json({ success: true, data: { payments: user.paymentHistory || [], totalSpent: user.totalSpent || 0 } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                               PAYMENT SECTION                              */
/* -------------------------------------------------------------------------- */

export const createSubscriptionCheckout = async (req, res) => {
  try {
    const { plan, autoRenew = true } = req.body;
    const dbPlan = await SubscriptionPlan.findOne({ name: plan, isActive: true });
    const selectedPlan = dbPlan ? { name: dbPlan.displayName, price: dbPlan.price, duration: dbPlan.duration, features: dbPlan.features } : SUBSCRIPTION_PLANS[plan];
    
    if (!selectedPlan) return res.status(400).json({ success: false, message: "Invalid plan" });
    if (!stripe) return res.status(503).json({ success: false, message: "Stripe not configured" });

    const clientUrl = process.env.PRODUCTION_URL || process.env.CLIENT_URL?.split(",")[0]?.trim() || "http://localhost:5173";
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `${selectedPlan.name} Subscription`, description: selectedPlan.features.join(", ") },
          unit_amount: Math.round(selectedPlan.price * 100),
          recurring: autoRenew ? { interval: "month" } : undefined,
        },
        quantity: 1,
      }],
      mode: autoRenew ? "subscription" : "payment",
      success_url: `${clientUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/profile`,
      customer_email: req.user.email,
      metadata: { userId: req.user._id.toString(), plan, autoRenew: autoRenew.toString() },
    });

    return res.status(200).json({ success: true, data: { sessionId: session.id, url: session.url } });
  } catch (error) {
    Logger.error("Checkout Error", error);
    return res.status(500).json({ success: false, message: "Checkout failed" });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) return res.status(400).send("Webhook config missing");

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) { return res.status(400).send(`Webhook Error: ${err.message}`); }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid") {
      const { userId, plan } = session.metadata;
      const user = await User.findById(userId);
      if (user) {
        const dbPlan = await SubscriptionPlan.findOne({ name: plan });
        const p = dbPlan || SUBSCRIPTION_PLANS[plan];
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (p.duration || 30));
        user.subscription = { plan, startDate: new Date(), endDate, isActive: true, autoRenew: session.metadata.autoRenew === "true" };
        user.paymentHistory.push({ amount: p.price, currency: "USD", paymentMethod: "stripe", transactionId: session.id, purpose: "subscription", status: "completed", createdAt: new Date() });
        user.totalSpent += (p.price || 0);
        await user.save();
      }
    }
  }
  res.json({ received: true });
};

export const verifyPaymentSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.userId !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Unauthorized" });
    return res.status(200).json({ success: true, data: { paymentStatus: session.payment_status, isPaid: session.payment_status === "paid" } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
};

/* -------------------------------------------------------------------------- */
/*                             PROMOTIONS SECTION                             */
/* -------------------------------------------------------------------------- */

export const createPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.create({ ...req.body, createdBy: req.user._id });
    return res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllPromotions = async (req, res) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: promos });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const validatePromoCode = async (req, res) => {
  try {
    const { promoCode, amount } = req.body;
    const promotion = await Promotion.findOne({ promoCode: promoCode.toUpperCase() });
    if (!promotion || !promotion.canBeUsed()) return res.status(400).json({ success: false, message: "Invalid/Expired code" });
    const discount = promotion.calculateDiscount(amount || 0);
    return res.status(200).json({ success: true, data: { discount } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getActivePromotions = async (req, res) => {
  try {
    const promos = await Promotion.find({ status: "active", endDate: { $gte: new Date() } });
    return res.status(200).json({ success: true, data: promos });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const applyPromoCode = async (req, res) => {
  try {
    const { promoCode, amount } = req.body;
    const promotion = await Promotion.findOne({ promoCode: promoCode.toUpperCase() });
    if (!promotion || !promotion.canBeUsed()) return res.status(400).json({ success: false, message: "Invalid code" });
    const discount = promotion.calculateDiscount(amount);
    await Promotion.findByIdAndUpdate(promotion._id, { $inc: { usedCount: 1 } });
    return res.status(200).json({ success: true, data: { discount, finalAmount: amount - discount } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPromotionById = async (req, res) => {
    try {
        const promo = await Promotion.findById(req.params.promotionId);
        return res.status(200).json({ success: true, data: promo });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const updatePromotion = async (req, res) => {
    try {
        const promo = await Promotion.findByIdAndUpdate(req.params.promotionId, req.body, { new: true });
        return res.status(200).json({ success: true, data: promo });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getPromotionStats = async (req, res) => {
    try {
      const total = await Promotion.countDocuments();
      const active = await Promotion.countDocuments({ status: "active" });
      return res.status(200).json({ success: true, data: { total, active } });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const deletePromotion = async (req, res) => {
    try {
      await Promotion.findByIdAndDelete(req.params.promotionId);
      return res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) { return res.status(500).json({ success: false }); }
};

/* -------------------------------------------------------------------------- */
/*                          SUBSCRIPTION PLANS SECTION                        */
/* -------------------------------------------------------------------------- */

export const getAllSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ order: 1 });
    return res.status(200).json({ success: true, data: plans });
  } catch (error) { return res.status(500).json({ success: false }); }
};

export const getActiveSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ order: 1 });
    return res.status(200).json({ success: true, data: plans });
  } catch (error) { return res.status(500).json({ success: false }); }
};

export const createSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.create({ ...req.body, createdBy: req.user._id });
    return res.status(201).json({ success: true, data: plan });
  } catch (error) { return res.status(500).json({ success: false }); }
};

export const updateSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.planId, req.body, { new: true });
    return res.status(200).json({ success: true, data: plan });
  } catch (error) { return res.status(500).json({ success: false }); }
};

export const toggleSubscriptionPlanStatus = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.planId);
    plan.isActive = !plan.isActive;
    await plan.save();
    return res.status(200).json({ success: true, data: plan });
  } catch (error) { return res.status(500).json({ success: false }); }
};

export const getSubscriptionPlanById = async (req, res) => {
    try {
      const plan = await SubscriptionPlan.findById(req.params.planId);
      return res.status(200).json({ success: true, data: plan });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const deleteSubscriptionPlan = async (req, res) => {
    try {
      await SubscriptionPlan.findByIdAndDelete(req.params.planId);
      return res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) { return res.status(500).json({ success: false }); }
};
// Admin Methods
export const getAllPayments = async (req, res) => {
    try {
        const users = await User.find({ 'paymentHistory.0': { $exists: true } }).select('name email role paymentHistory totalSpent subscription');
        const allPayments = [];
        users.forEach(u => u.paymentHistory.forEach(p => allPayments.push({ ...p.toObject(), userId: u._id, userName: u.name, userEmail: u.email })));
        allPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return res.status(200).json({ success: true, data: { payments: allPayments } });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getAllSubscriptions = async (req, res) => {
    try {
        const users = await User.find({ 'subscription.plan': { $ne: 'free' } }).select('name email role subscription totalSpent').sort({ 'subscription.endDate': -1 });
        return res.status(200).json({ success: true, data: users });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const adminUpdateSubscription = async (req, res) => {
    try {
        const { userId } = req.params;
        const { plan, duration = 30, isActive = true } = req.body;
        const dbPlan = await SubscriptionPlan.findOne({ name: plan });
        const p = dbPlan || SUBSCRIPTION_PLANS[plan];
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);
        const user = await User.findByIdAndUpdate(userId, { subscription: { plan, startDate: new Date(), endDate, isActive, autoRenew: false } }, { new: true });
        return res.status(200).json({ success: true, data: user });
    } catch (error) { return res.status(500).json({ success: false }); }
};
