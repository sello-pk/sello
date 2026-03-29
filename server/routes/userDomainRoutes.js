import express from "express";
import { upload, uploadSingle, uploadDealerProfile, uploadDealerRequest, uploadAuctionAccess, uploadVerification } from "../middlewares/multer.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { hasAnyPermission } from "../middlewares/permissionMiddleware.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Controllers
import {
  getUserProfile, updateProfile, updateDealerProfile, saveCar, unsaveCar, getSavedCars, requestSeller, requestDealer,
  getUserNotifications, markAsRead, markAllAsRead, getAllNotifications, createNotification, deleteNotification,
  submitVerification, getVerificationStatus, reviewVerification, getAllVerifications,
  createDeletionRequest, getDeletionRequestStatus, getAllDeletionRequests, getDeletionRequestStats, reviewDeletionRequest,
  getSavedSearches, createSavedSearch, getSavedSearch, updateSavedSearch, deleteSavedSearch, executeSavedSearch,
  addReview, getUserReviews, moderateReview, reportReview, getAllReviews,
  createReport, getReports, updateReportStatus, submitAuctionAccessRequest, getMyAuctionAccessStatus
} from "../controllers/userDomainController.js";

const router = express.Router();

/* ---------------------------------- USER ---------------------------------- */
// Profile
router.get("/users/me", auth, asyncHandler(getUserProfile));
router.put("/users/profile", auth, uploadSingle.single('avatar'), asyncHandler(updateProfile));
router.put(
  "/users/dealer-profile",
  auth,
  uploadDealerProfile,
  asyncHandler(updateDealerProfile),
);

// Wishlist
router.post("/users/wishlist/:carId", auth, asyncHandler(saveCar));
router.delete("/users/wishlist/:carId", auth, asyncHandler(unsaveCar));
router.get("/users/wishlist", auth, asyncHandler(getSavedCars));

// Roles/Requests
router.post("/users/request-seller", auth, asyncHandler(requestSeller));
router.post(
  "/users/request-dealer",
  auth,
  uploadDealerRequest,
  asyncHandler(requestDealer),
);
router.post(
  "/users/auction-access/request",
  auth,
  uploadAuctionAccess,
  asyncHandler(submitAuctionAccessRequest)
);
router.get("/users/auction-access/status", auth, asyncHandler(getMyAuctionAccessStatus));

/* --------------------------- NOTIFICATIONS --------------------------- */
router.get("/notifications", auth, asyncHandler(getUserNotifications));
router.get("/notifications/me", auth, asyncHandler(getUserNotifications)); // Alias for frontend
router.put("/notifications/:notificationId/read", auth, asyncHandler(markAsRead));
router.put("/notifications/read-all", auth, asyncHandler(markAllAsRead));
// Admin
router.get(
  "/notifications/admin",
  auth,
  authorize("admin"),
  hasAnyPermission("viewNotifications", "manageUsers"),
  asyncHandler(getAllNotifications),
);
router.post(
  "/notifications",
  auth,
  authorize("admin"),
  hasAnyPermission("createNotifications", "sendPushNotifications"),
  asyncHandler(createNotification),
);
router.delete(
  "/notifications/:notificationId",
  auth,
  authorize("admin"),
  hasAnyPermission("deleteNotifications", "manageUsers"),
  asyncHandler(deleteNotification),
);

/* --------------------------- VERIFICATION --------------------------- */
router.post("/verification/submit", auth, uploadVerification, asyncHandler(submitVerification));
router.get("/verification/status", auth, asyncHandler(getVerificationStatus));
// Admin
router.get(
  "/verification/admin/all",
  auth,
  authorize("admin"),
  hasAnyPermission("viewDealers", "manageUsers"),
  asyncHandler(getAllVerifications),
);
router.put(
  "/verification/admin/review/:verificationId",
  auth,
  authorize("admin"),
  hasAnyPermission("approveDealers", "manageUsers"),
  asyncHandler(reviewVerification),
);

/* --------------------------- ACCOUNT DELETION --------------------------- */
router.post("/account-deletion/request", auth, asyncHandler(createDeletionRequest));
router.get("/account-deletion/status", auth, asyncHandler(getDeletionRequestStatus));
// Admin
router.get(
  "/account-deletion/admin/all",
  auth,
  authorize("admin"),
  hasAnyPermission("viewUserProfiles", "viewFullUserProfiles"),
  asyncHandler(getAllDeletionRequests),
);
router.get(
  "/account-deletion/admin/stats",
  auth,
  authorize("admin"),
  hasAnyPermission("viewUserProfiles", "viewFullUserProfiles"),
  asyncHandler(getDeletionRequestStats),
);
router.put(
  "/account-deletion/admin/review/:requestId",
  auth,
  authorize("admin"),
  hasAnyPermission("manageUsers", "accessSensitiveAreas"),
  asyncHandler(reviewDeletionRequest),
);

/* --------------------------- SAVED SEARCHES --------------------------- */
router.get("/saved-searches", auth, asyncHandler(getSavedSearches));
router.post("/saved-searches", auth, asyncHandler(createSavedSearch));
router.get("/saved-searches/:searchId", auth, asyncHandler(getSavedSearch));
router.put("/saved-searches/:searchId", auth, asyncHandler(updateSavedSearch));
router.delete("/saved-searches/:searchId", auth, asyncHandler(deleteSavedSearch));
router.get("/saved-searches/:searchId/execute", auth, asyncHandler(executeSavedSearch));

/* ------------------------------- REVIEWS ------------------------------- */
router.post("/reviews", auth, asyncHandler(addReview));
router.get("/reviews/user/:userId", auth, asyncHandler(getUserReviews));
// Admin
router.get(
  "/reviews/admin/all",
  auth,
  authorize("admin"),
  hasAnyPermission("viewTestimonials", "manageTestimonials", "moderateComments"),
  asyncHandler(getAllReviews),
);
router.put(
  "/reviews/admin/moderate/:reviewId",
  auth,
  authorize("admin"),
  hasAnyPermission("manageTestimonials", "moderateComments"),
  asyncHandler(moderateReview),
);
router.post("/reviews/:reviewId/report", auth, asyncHandler(reportReview));

/* ------------------------------- REPORTS ------------------------------- */
router.post("/reports", auth, asyncHandler(createReport));
// Admin
router.get(
  "/reports/admin/all",
  auth,
  authorize("admin"),
  hasAnyPermission("viewAnalytics", "createReports", "viewInquiries"),
  asyncHandler(getReports),
);
router.put(
  "/reports/admin/:reportId/status",
  auth,
  authorize("admin"),
  hasAnyPermission("manageUsers", "editReports", "deleteReports"),
  asyncHandler(updateReportStatus),
);

export default router;
