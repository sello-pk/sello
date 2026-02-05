import express from "express";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { hasPermission, hasAnyPermission } from "../middlewares/permissionMiddleware.js";
import { upload } from "../middlewares/multer.js";

// Controllers
import {
  getDashboardStats, getAllUsers, getUserById, updateUser, deleteUser, approveCar, deleteCar, getAllCars, featureCar, getAllDealers, verifyUser, verifyDealer, getListingHistory, getAuditLogsController, getAnalyticsSummary, trackAnalyticsEvent
} from "../controllers/adminController.js";
import {
  getAllRoles, getRoleById, createRole, updateRole, deleteRole, inviteUser, getAllInvites, updateInvite, deleteInvite, resendInvite, cancelInvite, getPermissionMatrix, initializeRoles, getInviteByToken, acceptInvite
} from "../controllers/roleController.js";
import {
  getAllSettings, getSetting, upsertSetting, deleteSetting, uploadFile
} from "../controllers/settingsController.js";

const router = express.Router();

/* ---------------------------------- ADMIN --------------------------------- */
router.use("/admin", auth, authorize("admin"));
router.get("/admin/dashboard", getDashboardStats);
router.get("/admin/users", hasPermission("manageUsers"), getAllUsers);
router.get("/admin/users/:userId", hasPermission("manageUsers"), getUserById);
router.put("/admin/users/:userId", hasPermission("manageUsers"), updateUser);
router.delete("/admin/users/:userId", hasPermission("manageUsers"), deleteUser);
router.put("/admin/users/:userId/verify", hasPermission("manageUsers"), verifyUser);
router.get("/admin/listings", hasPermission("viewListings"), getAllCars);
router.put("/admin/listings/:carId/approve", hasPermission("manageListings"), approveCar);
router.put("/admin/listings/:carId/feature", hasPermission("manageListings"), featureCar);
router.delete("/admin/listings/:carId", hasPermission("manageListings"), deleteCar);
router.get("/admin/dealers", hasPermission("viewDealers"), getAllDealers);
router.get("/admin/analytics/summary", getAnalyticsSummary);

/* ---------------------------------- ROLES --------------------------------- */
// Public invites
router.get("/roles/invite/:token", getInviteByToken);
router.post("/roles/invite/:token/accept", acceptInvite);
// Protected Roles
router.use("/roles", auth, authorize("admin"));
router.get("/roles", hasAnyPermission("manageUsers", "createRoles"), getAllRoles);
router.get("/roles/matrix", hasAnyPermission("manageUsers", "createRoles"), getPermissionMatrix);
router.get("/roles/invites/all", hasPermission("manageUsers"), getAllInvites);

// Roles CRUD
router.post("/roles", hasPermission("createRoles"), createRole);
router.get("/roles/:roleId", hasAnyPermission("manageUsers", "createRoles"), getRoleById);
router.put("/roles/:roleId", hasPermission("editRoles"), updateRole);
router.delete("/roles/:roleId", hasPermission("deleteRoles"), deleteRole);

// Invites management
router.post("/roles/invite", hasPermission("inviteUsers"), inviteUser);
router.put("/roles/invites/:inviteId", hasPermission("inviteUsers"), updateInvite);
router.delete("/roles/invites/:inviteId", hasPermission("inviteUsers"), deleteInvite);
router.post("/roles/invites/:inviteId/resend", hasPermission("inviteUsers"), resendInvite);
router.post("/roles/invites/:inviteId/cancel", hasPermission("inviteUsers"), cancelInvite);

/* -------------------------------- SETTINGS -------------------------------- */
router.use("/settings", auth, authorize("admin"));
router.get("/settings", hasAnyPermission("viewSettings", "managePlatformSettings"), getAllSettings);
router.get("/settings/:key", hasAnyPermission("viewSettings", "managePlatformSettings"), getSetting);
router.post("/settings", hasPermission("managePlatformSettings"), upsertSetting);

export default router;
