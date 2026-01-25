import express from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  inviteUser,
  getAllInvites,
  updateInvite,
  deleteInvite,
  resendInvite,
  cancelInvite,
  getPermissionMatrix,
  initializeRoles,
  getInviteByToken,
  acceptInvite,
  fixCustomRoles,
} from "../controllers/roleController.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { hasPermission, hasAnyPermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// Public invite routes (no auth required)
router.get("/invite/:token", getInviteByToken);
router.post("/invite/:token/accept", acceptInvite);

// All other routes require authentication and admin role
router.use(auth);
router.use(authorize("admin"));

// Initialize roles (one-time setup) - requires createRoles permission
router.post("/initialize", hasPermission("createRoles"), initializeRoles);

// Fix custom roles that incorrectly have isPreset: true (temporary fix)
router.post("/fix-custom-roles", fixCustomRoles);

// Role management routes - require appropriate permissions
router.get(
  "/",
  hasAnyPermission("manageUsers", "createRoles", "editRoles", "deleteRoles", "inviteUsers"),
  getAllRoles
); // View roles
router.get(
  "/matrix",
  hasAnyPermission("manageUsers", "createRoles", "editRoles", "deleteRoles", "inviteUsers"),
  getPermissionMatrix
); // View matrix
router.get(
  "/:roleId",
  hasAnyPermission("manageUsers", "createRoles", "editRoles", "deleteRoles", "inviteUsers"),
  getRoleById
); // View role
router.post("/", hasPermission("createRoles"), createRole); // Create role
router.put("/:roleId", hasPermission("editRoles"), updateRole); // Update role
router.delete("/:roleId", hasPermission("deleteRoles"), deleteRole); // Delete role

// Invite management routes - admin only
router.post("/invite", hasPermission("inviteUsers"), inviteUser);
router.get("/invites/all", hasPermission("inviteUsers"), getAllInvites);
router.put("/invites/:inviteId", hasPermission("inviteUsers"), updateInvite); // Update invite
router.delete("/invites/:inviteId", hasPermission("inviteUsers"), deleteInvite); // Delete invite
router.post("/invites/:inviteId/resend", hasPermission("inviteUsers"), resendInvite); // Resend invite
router.post("/invites/:inviteId/cancel", hasPermission("inviteUsers"), cancelInvite); // Cancel invite

export default router;
