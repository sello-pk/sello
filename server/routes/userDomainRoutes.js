import express from "express";
import { upload } from "../middlewares/multer.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";

// Controllers
import {
  getUserProfile, updateProfile, updateDealerProfile, saveCar, unsaveCar, getSavedCars, requestSeller, requestDealer,
  getUserNotifications, markAsRead, markAllAsRead, getAllNotifications, createNotification, deleteNotification,
  submitVerification, getVerificationStatus, reviewVerification, getAllVerifications,
  createDeletionRequest, getDeletionRequestStatus, getAllDeletionRequests, getDeletionRequestStats, reviewDeletionRequest,
  getSavedSearches, createSavedSearch, getSavedSearch, updateSavedSearch, deleteSavedSearch, executeSavedSearch,
  addReview, getUserReviews, moderateReview, reportReview, getAllReviews,
  createReport, getReports, updateReportStatus
} from "../controllers/userDomainController.js";

const router = express.Router();

/* ---------------------------------- USER ---------------------------------- */
// Profile
router.get("/users/me", auth, getUserProfile);
router.put("/users/profile", auth, upload.single("avatar"), updateProfile);
router.put("/users/dealer-profile", auth, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'businessLicense', maxCount: 1 }, { name: 'showroomImages', maxCount: 10 }]), updateDealerProfile);

// Wishlist
router.post("/users/wishlist/:carId", auth, saveCar);
router.delete("/users/wishlist/:carId", auth, unsaveCar);
router.get("/users/wishlist", auth, getSavedCars);

// Roles/Requests
router.post("/users/request-seller", auth, requestSeller);
router.post("/users/request-dealer", auth, upload.fields([{ name: 'businessLicense', maxCount: 1 }]), requestDealer);

/* --------------------------- NOTIFICATIONS --------------------------- */
router.get("/notifications", auth, getUserNotifications);
router.get("/notifications/me", auth, getUserNotifications); // Alias for frontend
router.put("/notifications/:notificationId/read", auth, markAsRead);
router.put("/notifications/read-all", auth, markAllAsRead);
// Admin
router.get("/notifications/admin", auth, authorize("admin"), getAllNotifications);
router.post("/notifications", auth, authorize("admin"), createNotification);
router.delete("/notifications/:notificationId", auth, authorize("admin"), deleteNotification);

/* --------------------------- VERIFICATION --------------------------- */
router.post("/verification/submit", auth, upload.fields([{ name: "frontDocument", maxCount: 1 }, { name: "backDocument", maxCount: 1 }]), submitVerification);
router.get("/verification/status", auth, getVerificationStatus);
// Admin
router.get("/verification/admin/all", auth, authorize("admin"), getAllVerifications);
router.put("/verification/admin/review/:verificationId", auth, authorize("admin"), reviewVerification);

/* --------------------------- ACCOUNT DELETION --------------------------- */
router.post("/account-deletion/request", auth, createDeletionRequest);
router.get("/account-deletion/status", auth, getDeletionRequestStatus);
// Admin
router.get("/account-deletion/admin/all", auth, authorize("admin"), getAllDeletionRequests);
router.get("/account-deletion/admin/stats", auth, authorize("admin"), getDeletionRequestStats);
router.put("/account-deletion/admin/review/:requestId", auth, authorize("admin"), reviewDeletionRequest);

/* --------------------------- SAVED SEARCHES --------------------------- */
router.get("/saved-searches", auth, getSavedSearches);
router.post("/saved-searches", auth, createSavedSearch);
router.get("/saved-searches/:searchId", auth, getSavedSearch);
router.put("/saved-searches/:searchId", auth, updateSavedSearch);
router.delete("/saved-searches/:searchId", auth, deleteSavedSearch);
router.get("/saved-searches/:searchId/execute", auth, executeSavedSearch);

/* ------------------------------- REVIEWS ------------------------------- */
router.post("/reviews", auth, addReview);
router.get("/reviews/user/:userId", auth, getUserReviews);
// Admin
router.get("/reviews/admin/all", auth, authorize("admin"), getAllReviews);
router.put("/reviews/admin/moderate/:reviewId", auth, authorize("admin"), moderateReview);
router.post("/reviews/:reviewId/report", auth, reportReview);

/* ------------------------------- REPORTS ------------------------------- */
router.post("/reports", auth, createReport);
// Admin
router.get("/reports/admin/all", auth, authorize("admin"), getReports);
router.put("/reports/admin/:reportId/status", auth, authorize("admin"), updateReportStatus);

export default router;
