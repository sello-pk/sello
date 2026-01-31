import express from "express";
const router = express.Router();

// Domain Routes (Consolidated)
import authRoutes from "./authRoutes.js";
import contentRoutes from "./contentDomainRoutes.js";
import messagingRoutes from "./messagingDomainRoutes.js";
import adminDomainRoutes from "./adminDomainRoutes.js";
import userDomainRoutes from "./userDomainRoutes.js";
import inventoryDomainRoutes from "./inventoryDomainRoutes.js";
import billingDomainRoutes from "./billingDomainRoutes.js";
import utilityDomainRoutes from "./utilityDomainRoutes.js";

// Mapping
router.use("/auth", authRoutes); // Auth remains separate as it's the core entry point
router.use("/", contentRoutes); // /banners, /blogs, /testimonials, /newsletter, /categories
router.use("/", messagingRoutes); // /support-chat, /car-chat, /chat, /contact
router.use("/", adminDomainRoutes); // /admin, /roles, /settings
router.use("/", userDomainRoutes); // /users, /notifications, /verification, /account-deletion, /saved-searches, /reviews
router.use("/", inventoryDomainRoutes); // /cars, /valuations, /vehicle-attributes
router.use("/", billingDomainRoutes); // /billing, /subscription-plans
router.use("/", utilityDomainRoutes); // /utility (analytics, maps, upload, seo)

export default router;
