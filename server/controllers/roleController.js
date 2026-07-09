import Role from "../models/roleModel.js";
import User from "../models/userModel.js";
import Invite from "../models/inviteModel.js";
import Notification from "../models/notificationModel.js";
import { createAuditLog } from "../utils/logger.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import Logger from "../utils/logger.js";
import {
  CANONICAL_ROLE_PRESETS,
  LEGACY_ROLE_NAME_MAP,
  PERMISSION_KEYS,
  SYSTEM_ROLE_NAMES,
  resolveCanonicalRoleName,
  sanitizePermissionMap,
  isSystemRoleName,
} from "../config/rbacPolicy.js";

const ROLE_PRESETS = CANONICAL_ROLE_PRESETS;
const hasAdminActor = (user) => Boolean(user && user.role === "admin");

const normalizeRoleLabel = (value = "") =>
  resolveCanonicalRoleName(String(value || "").trim());

const sanitizePermissionsInput = (permissions = {}) =>
  sanitizePermissionMap(permissions || {});

/**
 * Initialize default roles
 */
export const initializeRoles = async () => {
  try {
    for (const preset of Object.values(ROLE_PRESETS)) {
      const existingRole = await Role.findOne({ name: preset.name });
      if (!existingRole) {
        await Role.create(preset);
      } else if (existingRole.isPreset) {
        existingRole.displayName = preset.displayName;
        existingRole.accessLevel = preset.accessLevel;
        existingRole.purpose = preset.purpose;
        existingRole.permissions = sanitizePermissionsInput(preset.permissions);
        existingRole.restrictions = preset.restrictions || [];
        existingRole.isActive = true;
        await existingRole.save();
      }
    }
  } catch (error) {
    Logger.error("Initialize Roles Error", error);
  }
};

/**
 * Get all roles
 */
export const getAllRoles = async (req, res) => {
  try {
    // Only admin can view roles
    if (!hasAdminActor(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can view roles.",
      });
    }

    // Get only active roles (exclude deleted ones)
    const roles = await Role.find({ isActive: true }).sort({ name: 1 });

    // Debug logging
    Logger.info("Get All Roles - Debug", {
      totalRolesFound: roles.length,
      roles: roles.map((r) => ({
        id: r._id,
        name: r.name,
        displayName: r.displayName,
        isActive: r.isActive,
        isPreset: r.isPreset,
      })),
    });

    return res.status(200).json({
      success: true,
      message: "Roles retrieved successfully.",
      data: roles,
    });
  } catch (error) {
    Logger.error("Get All Roles Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get role by ID
 */
export const getRoleById = async (req, res) => {
  try {
    if (!hasAdminActor(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can view role details.",
      });
    }

    const { roleId } = req.params;
    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role retrieved successfully.",
      data: role,
    });
  } catch (error) {
    Logger.error("Get Role By ID Error", error, {
      roleId: req.params.roleId,
      userId: req.user?._id,
    });
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Create role
 */
export const createRole = async (req, res) => {
  try {
    // Enhanced admin check - only admin can create roles
    if (!hasAdminActor(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admin can create roles.",
      });
    }

    const {
      name,
      displayName,
      accessLevel,
      purpose,
      permissions,
      restrictions,
      isTeamRole,
    } = req.body;

    if (!name || !displayName || !accessLevel || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Name, displayName, accessLevel, and purpose are required.",
      });
    }

    // Check if role name already exists (only check active roles)
    const existingRole = await Role.findOne({ name, isActive: true });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "Role with this name already exists.",
      });
    }

    // Create role with all permissions independent
    const roleData = {
      name,
      displayName,
      accessLevel,
      purpose,
      permissions: sanitizePermissionsInput(permissions || {}),
      restrictions: restrictions || [],
      isTeamRole: isTeamRole || false,
      isPreset: false, // Explicitly set to false for custom roles
      createdBy: req.user._id,
      updatedBy: req.user._id,
    };

    const role = await Role.create(roleData);

    await createAuditLog(
      req.user,
      "role_created",
      {
        roleId: role._id,
        roleName: role.name,
      },
      null,
      req,
    );

    return res.status(201).json({
      success: true,
      message: "Role created successfully.",
      data: role,
    });
  } catch (error) {
    Logger.error("Create Role Error", error, {
      userId: req.user?._id,
      roleData: req.body,
    });
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update role
 */
export const updateRole = async (req, res) => {
  try {
    // Enhanced admin check - only admin can update roles
    if (!hasAdminActor(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admin can update roles.",
      });
    }

    const { roleId } = req.params;
    const {
      name,
      displayName,
      accessLevel,
      purpose,
      permissions,
      restrictions,
      isTeamRole,
    } = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    // Update role with independent permissions
    if (name) role.name = name;
    if (displayName) role.displayName = displayName;
    if (accessLevel) role.accessLevel = accessLevel;
    if (purpose) role.purpose = purpose;
    if (permissions) {
      role.permissions = {
        ...sanitizePermissionsInput(role.permissions || {}),
        ...sanitizePermissionsInput(permissions),
      };
    }
    if (restrictions) role.restrictions = restrictions;
    if (typeof isTeamRole === "boolean") role.isTeamRole = isTeamRole;
    role.updatedBy = req.user._id;

    await role.save();

    await createAuditLog(
      req.user,
      "role_updated",
      {
        roleId: role._id,
        roleName: role.name,
      },
      null,
      req,
    );

    return res.status(200).json({
      success: true,
      message: "Role updated successfully.",
      data: role,
    });
  } catch (error) {
    Logger.error("Update Role Error", error, {
      roleId: req.params.roleId,
      userId: req.user?._id,
    });
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete role
 */
export const deleteRole = async (req, res) => {
  try {
    // Enhanced admin check - only admin can delete roles
    if (!hasAdminActor(req.user)) {
      Logger.error("Delete role - Access denied", {
        userId: req.user?._id,
        userRole: req.user?.role,
      });
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admin can delete roles.",
      });
    }

    const { roleId } = req.params;
    Logger.info("Delete role attempt", { roleId, userId: req.user?._id });

    // Validate roleId
    if (!roleId || !mongoose.Types.ObjectId.isValid(roleId)) {
      Logger.error("Delete role - Invalid role ID", { roleId });
      return res.status(400).json({
        success: false,
        message: "Invalid role ID.",
      });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      Logger.error("Delete role - Role not found", { roleId });
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    // Prevent deleting preset roles
    if (role.isPreset) {
      Logger.error("Delete role - Attempt to delete preset role", {
        roleId,
        roleName: role.name,
      });
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete preset roles. Only custom roles can be deleted.",
      });
    }

    // Check if any users are using this role (with timeout protection)
    let usersWithRole = 0;
    try {
      // Add timeout to prevent hanging queries (increased to 30s)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("User count query timeout")), 30000),
      );

      usersWithRole = await Promise.race([
        User.countDocuments({ roleId: roleId }),
        timeoutPromise,
      ]);

      if (usersWithRole > 0) {
        Logger.error("Delete role - Role assigned to users", {
          roleId,
          usersWithRole,
        });
        return res.status(400).json({
          success: false,
          message: `Cannot delete role. ${usersWithRole} user(s) are assigned to this role. Please reassign or delete these users first.`,
        });
      }
    } catch (userError) {
      if (userError.message === "User count query timeout") {
        Logger.error("Delete role - User count query timeout", { roleId });
        return res.status(408).json({
          success: false,
          message:
            "Request timeout while checking users assigned to this role. Please try again.",
        });
      }
      Logger.error("Error checking users with role", userError);
      // Continue with deletion even if user check fails
    }

    // Check if there's already an inactive role with the same name
    const existingInactiveRole = await Role.findOne({
      name: role.name,
      isActive: false,
      _id: { $ne: roleId }, // Exclude current role
    });

    if (existingInactiveRole) {
      // If there's already an inactive role with same name, hard delete to avoid index conflict
      Logger.info(
        "Delete role - Hard deleting due to name conflict with inactive role",
        {
          roleId: role._id,
          roleName: role.name,
          conflictingInactiveRoleId: existingInactiveRole._id,
        },
      );

      await Role.deleteOne({ _id: roleId });
    } else {
      // Soft delete - mark as inactive (safe when no name conflicts)
      await Role.findOneAndUpdate(
        { _id: roleId },
        { isActive: false },
        { new: true },
      );
    }

    Logger.info("Delete role - Role deletion completed", {
      roleId: role._id,
      roleName: role.name,
      originalIsActive: role.isActive,
      isPreset: role.isPreset,
      deletionType: existingInactiveRole ? "hard_delete" : "soft_delete",
    });

    // Verify the role was actually updated/deleted
    const updatedRole = await Role.findById(roleId);
    Logger.info("Delete role - Verification", {
      roleId: roleId,
      roleExists: !!updatedRole,
      updatedIsActive: updatedRole?.isActive,
      updatedIsPreset: updatedRole?.isPreset,
    });

    // Create audit log asynchronously (non-blocking to prevent timeouts)
    setImmediate(async () => {
      try {
        await createAuditLog(
          req.user,
          "role_deleted",
          {
            roleId: role._id,
            roleName: role.name,
            roleDisplayName: role.displayName,
          },
          null,
          req,
        );
      } catch (auditError) {
        Logger.error("Delete role - Audit log failed", auditError);
      }
    });

    Logger.info("Delete role - Success", { roleId, roleName: role.name });
    return res.status(200).json({
      success: true,
      message: "Role deleted successfully.",
    });
  } catch (error) {
    Logger.error("Delete Role Error", error, {
      roleId: req.params.roleId,
      userId: req.user?._id,
    });
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Invite user
 */
export const inviteUser = async (req, res) => {
  try {
    if (!hasAdminActor(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can invite users.",
      });
    }

    const {
      email,
      fullName,
      phone,
      role,
      roleId: requestedRoleId,
      permissions,
      expirationDays,
      password,
      twoFactorCode,
    } = req.body;

    if (!email || !fullName || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, fullName, and role are required.",
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Log the invite (non-blocking - don't fail if audit log fails)
    try {
      await createAuditLog(
        req.user,
        "user_invited",
        {
          targetEmail: email,
          role: role,
        },
        null,
        req,
      );
    } catch (auditError) {
      Logger.error("Audit log error (non-blocking)", auditError);
      // Continue with invite creation even if audit log fails
    }

    // Resolve role data and permissions (used for both existing user update and new invite)
    let roleData = null;
    let rolePermissions = sanitizePermissionsInput(permissions || {});
    let finalRole = normalizeRoleLabel(role);
    let resolvedRoleId = requestedRoleId;

    if (resolvedRoleId) {
      try {
        roleData = await Role.findById(resolvedRoleId);
        if (roleData) {
          rolePermissions = sanitizePermissionsInput(roleData.permissions || {});
          finalRole = normalizeRoleLabel(
            roleData.displayName || roleData.name || finalRole,
          );
        }
      } catch (roleError) {
        Logger.error("Error fetching role", roleError, { roleId: resolvedRoleId });
      }
    }

    if (!roleData && finalRole && finalRole !== "Custom") {
      try {
        roleData = await Role.findOne({
          $or: [{ name: finalRole }, { displayName: finalRole }],
        });
        if (roleData) {
          rolePermissions = sanitizePermissionsInput(roleData.permissions || {});
          finalRole = normalizeRoleLabel(
            roleData.displayName || roleData.name || finalRole,
          );
          if (!resolvedRoleId) {
            resolvedRoleId = roleData._id;
          }
        } else {
          const preset = ROLE_PRESETS[finalRole];
          if (preset) {
            rolePermissions = sanitizePermissionsInput(preset.permissions);
          }
        }
      } catch (roleError) {
        Logger.error("Error finding role", roleError, { role: finalRole });
        const preset = ROLE_PRESETS[finalRole];
        if (preset) {
          rolePermissions = sanitizePermissionsInput(preset.permissions);
        }
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      if (existingUser.status === "active") {
        const existingAdminRole = resolveCanonicalRoleName(
          existingUser.adminRole || "",
        );
        const hasRole =
          existingAdminRole === finalRole ||
          (existingUser.roleId &&
            requestedRoleId &&
            existingUser.roleId.toString() === requestedRoleId.toString());

        if (hasRole) {
          return res.status(409).json({
            success: false,
            message: `User already exists with the "${role}" role.`,
            code: "USER_EXISTS_WITH_ROLE",
            data: {
              userId: existingUser._id,
              email: existingUser.email,
              fullName: existingUser.fullName,
              currentRole: existingUser.role,
              status: existingUser.status,
            },
          });
        }

        // Active user with different role — update their role directly
        const prevRole = existingUser.role;
        existingUser.role = "admin";
        existingUser.adminRole = finalRole;
        existingUser.roleId = resolvedRoleId || null;
        existingUser.permissions = sanitizePermissionsInput(rolePermissions);
        if (fullName) existingUser.name = fullName;
        if (phone) existingUser.phone = phone;
        await existingUser.save();

        await createAuditLog(
          req.user,
          "user_role_updated_via_invite",
          {
            targetUserId: existingUser._id,
            targetEmail: existingUser.email,
            previousRole: prevRole,
            newRole: "admin",
            newAdminRole: finalRole,
          },
          null,
          req,
        );

        const siteName = process.env.SITE_NAME || "Sello";
        const notifMessage = `${existingUser.name}'s role has been updated to ${finalRole} in the ${siteName} Admin Panel.`;

        try {
          const notification = await Notification.create({
            title: "User Role Updated",
            message: notifMessage,
            type: "success",
            recipient: req.user._id,
          });
          const io = req.app.get("io");
          if (io) {
            io.to(`user:${req.user._id}`).emit("new-notification", notification);
          }
        } catch (notifError) {
          Logger.error("Notification error (non-blocking)", notifError);
        }

        return res.status(200).json({
          success: true,
          message: `${existingUser.name}'s role has been updated to ${finalRole}.`,
          data: {
            userId: existingUser._id,
            email: existingUser.email,
            fullName: existingUser.name,
            role: "admin",
            adminRole: finalRole,
            updated: true,
          },
        });
      }

      // Inactive/suspended user — reactivate with the requested role
      existingUser.status = "active";
      existingUser.role = "admin";
      existingUser.adminRole = finalRole;
      existingUser.roleId = resolvedRoleId || null;
      existingUser.permissions = sanitizePermissionsInput(rolePermissions);
      if (fullName) existingUser.name = fullName;
      if (phone) existingUser.phone = phone;
      await existingUser.save();

      await createAuditLog(
        req.user,
        "user_reactivated_via_invite",
        {
          targetUserId: existingUser._id,
          targetEmail: existingUser.email,
          newRole: "admin",
          newAdminRole: finalRole,
        },
        null,
        req,
      );

      return res.status(200).json({
        success: true,
        message: `User ${existingUser.name} has been reactivated with role ${finalRole}.`,
        data: {
          userId: existingUser._id,
          email: existingUser.email,
          fullName: existingUser.name,
          role: "admin",
          adminRole: finalRole,
          reactivated: true,
        },
      });
    }

    // Cancel any existing pending invites for this email
    await Invite.updateMany(
      { email: email.toLowerCase(), status: "pending" },
      { status: "cancelled" },
    );

    // Generate token
    const token = Invite.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expirationDays || 7));

    // Create invite
    let invite;
    try {
      invite = await Invite.create({
        email: email.toLowerCase(),
        fullName,
        phone: phone || null, // Phone is optional
        role: finalRole,
        roleId: resolvedRoleId || null,
        permissions: rolePermissions,
        token,
        expiresAt,
        invitedBy: req.user._id,
      });
    } catch (inviteError) {
      // If it's a validation error, provide better message
      if (inviteError.name === "ValidationError") {
        const errors = Object.values(inviteError.errors)
          .map((e) => e.message)
          .join(", ");
        return res.status(400).json({
          success: false,
          message: `Validation error: ${errors}`,
          error:
            process.env.NODE_ENV === "development"
              ? {
                  message: inviteError.message,
                  errors: Object.keys(inviteError.errors),
                }
              : undefined,
        });
      }
      throw inviteError; // Re-throw if it's not a validation error
    }

    // Send invite email
    // Use production URL if in production, otherwise use CLIENT_URL or localhost
    const frontendUrl =
      process.env.NODE_ENV === "production"
        ? process.env.PRODUCTION_URL ||
          process.env.CLIENT_URL?.split(",")[0]?.trim()
        : process.env.CLIENT_URL?.split(",")[0]?.trim() ||
          (req.headers.origin ? new URL(req.headers.origin).origin : null) ||
          "http://localhost:5173";

    const inviteUrl = `${frontendUrl}/accept-invite/${token}`;
    const siteName = process.env.SITE_NAME || "Sello";
    const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Admin Panel Invitation</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #FFA602 0%, #FF6B00 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Admin Panel Invitation</h1>
                </div>
                <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; margin-top: 0;">Hello <strong>${fullName}</strong>,</p>
                    <p>You have been invited by <strong>${
                      req.user.name
                    }</strong> (${
                      req.user.email
                    }) to join the <strong>${siteName}</strong> Admin Panel as <strong>${finalRole}</strong>.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${inviteUrl}" style="background-color: #FFA602; color: #111827; padding: 14px 28px; text-decoration: none; border-radius: 999px; display: inline-block; font-weight: 700; font-size: 16px; box-shadow: 0 10px 25px rgba(255, 166, 2, 0.35); letter-spacing: 0.3px;">Accept Invitation</a>
                    </div>
                    <p style="color: #666; font-size: 14px; margin-top: 20px;">
                        <strong>Or copy this link:</strong><br>
                        <a href="${inviteUrl}" style="color: #FF6B00; word-break: break-all; text-decoration: underline;">${inviteUrl}</a>
                    </p>
                    <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                        <strong>Important:</strong> This invitation will expire on <strong>${expiresAt.toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" },
                        )}</strong>.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; margin-bottom: 0;">
                        If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                </div>
            </body>
            </html>
        `;

    // Send email (non-blocking - invite is created regardless)
    let emailSent = false;
    let emailError = null;
    let actualEmailSent = false; // Track if email was actually sent (not just dev mode)

    try {
      const emailResult = await sendEmail(
        email,
        `Invitation to join ${siteName} Admin Panel`,
        emailHtml,
      );

      // Check if email was actually sent (not just dev mode simulation)
      // Improved check: verify actuallySent is explicitly true and messageId is not 'dev-mode'
      if (
        emailResult &&
        emailResult.actuallySent === true &&
        emailResult.messageId &&
        emailResult.messageId !== "dev-mode"
      ) {
        emailSent = true;
        actualEmailSent = true;
        Logger.info("Invite email sent successfully", {
          inviteId: invite._id,
          email: email,
          messageId: emailResult.messageId,
        });
      } else {
        // Email was not actually sent (dev mode, disabled, or other issue)
        if (emailResult?.messageId === "dev-mode") {
          emailError =
            "SMTP not configured. Email was not sent. Please share the invite URL manually.";
        } else if (emailResult?.messageId === "disabled") {
          emailError =
            "Email notifications are disabled. Please share the invite URL manually.";
        } else {
          emailError = "Email sending failed or was not configured properly.";
        }
        emailSent = false;
        Logger.warn("Invite email not sent", {
          inviteId: invite._id,
          email: email,
          reason: emailError,
          emailResult: emailResult,
        });
      }
    } catch (emailErr) {
      emailError =
        emailErr.message || "Unknown error occurred while sending email";
      emailSent = false;
      Logger.error("Invite email sending error", emailErr, {
        inviteId: invite._id,
        email: email,
      });
      // Continue - invite is created, email failure shouldn't block the process
    }

    // Log successful invite creation (non-blocking)
    try {
      await createAuditLog(
        req.user,
        "user_invited",
        {
          inviteId: invite._id,
          email: invite.email,
          role: invite.role,
          emailSent: emailSent,
        },
        null,
        req,
      );
    } catch (auditError) {
      Logger.error("Audit log error (non-blocking)", auditError);
    }

    // Create in-app notification for the admin
    try {
      const notifMessage =
        emailSent && actualEmailSent
          ? `Invitation sent to ${email} as ${finalRole}`
          : `Invitation created for ${email}. Email failed to send.`;

      const notifType = emailSent && actualEmailSent ? "success" : "warning";

      const notification = await Notification.create({
        title: "User Invited",
        message: notifMessage,
        type: notifType,
        recipient: req.user._id, // Notify the admin who performed the action
        actionUrl: `/admin/settings?tab=users`,
        actionText: "View Users",
      });

      // Emit socket event to the admin immediately
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${req.user._id}`).emit("new-notification", notification);
      }
    } catch (notifError) {
      Logger.error("Notification creation error", notifError, {
        inviteId: invite._id,
      });
    }

    // Always include invite URL in response for manual sharing if needed
    const responseData = {
      success: true,
      message:
        emailSent && actualEmailSent
          ? `Invitation sent successfully to ${email} as ${finalRole}.`
          : `Invitation created for ${email}. Email was not sent - please share the invite URL manually.`,
      data: {
        invite: invite,
        inviteUrl: inviteUrl,
        email: email,
        fullName: fullName,
        role: finalRole,
        expiresAt: expiresAt,
        invitedBy: req.user.name || req.user.email,
      },
      emailSent: emailSent && actualEmailSent,
      meta: {
        expiresIn: `${expirationDays || 7} days`,
        canResend: true,
        canCancel: true,
      },
    };

    // Add warning if email was not sent
    if (!emailSent || !actualEmailSent) {
      responseData.warning =
        emailError ||
        "SMTP is not configured. Please share the invite URL manually or configure SMTP settings.";
    }

    return res.status(201).json(responseData);
  } catch (error) {
    // Prevent double response sending
    if (res.headersSent) {
      Logger.error("Invite User Error - Response already sent", error, {
        email: req.body?.email,
        role: req.body?.role,
        userId: req.user?._id,
      });
      return;
    }

    Logger.error("Invite User Error", error, {
      email: req.body?.email,
      role: req.body?.role,
      userId: req.user?._id,
    });

    // Provide more specific error messages
    let errorMessage = "Server error. Please try again later.";
    let statusCode = 500;

    if (error.name === "ValidationError") {
      statusCode = 400;
      const errors = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      errorMessage = `Validation error: ${errors}`;
    } else if (error.name === "MongoServerError" && error.code === 11000) {
      statusCode = 409;
      errorMessage = "An invite with this email already exists.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : undefined,
    });
  }
};

/**
 * Update invite
 */
export const updateInvite = async (req, res) => {
  try {
    // Enhanced admin check - only admin can update invites
    if (!hasAdminActor(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admin can update invites.",
      });
    }

    const { inviteId } = req.params;
    const { fullName, phone, role, roleId, permissions, expirationDays } =
      req.body;

    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found.",
      });
    }

    // Only update pending invites
    if (invite.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot update invite. Invite has already been " +
          invite.status +
          ".",
      });
    }

    // Update invite fields
    if (fullName) invite.fullName = fullName;
    if (phone !== undefined) invite.phone = phone;
    if (role) invite.role = normalizeRoleLabel(role);
    if (roleId) invite.roleId = roleId;
    if (permissions) invite.permissions = sanitizePermissionsInput(permissions);
    if (expirationDays) {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + parseInt(expirationDays));
      invite.expiresAt = newExpiry;
    }

    await invite.save();

    await createAuditLog(
      req.user,
      "invite_updated",
      {
        inviteId: invite._id,
        targetEmail: invite.email,
      },
      null,
      req,
    );

    return res.status(200).json({
      success: true,
      message: "Invite updated successfully.",
      data: invite,
    });
  } catch (error) {
    Logger.error("Update Invite Error", error, {
      inviteId: req.params.inviteId,
      userId: req.user?._id,
    });
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Assign role to existing admin/team user
 */
export const assignUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId, permissions } = req.body;

    if (!roleId || !mongoose.Types.ObjectId.isValid(roleId)) {
      return res.status(400).json({
        success: false,
        message: "Valid roleId is required.",
      });
    }

    const [user, role] = await Promise.all([
      User.findById(userId),
      Role.findById(roleId),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!role || !role.isActive) {
      return res.status(404).json({
        success: false,
        message: "Role not found or inactive.",
      });
    }

    const explicitOverrides = sanitizePermissionsInput(permissions || {});

    user.role = "admin";
    user.adminRole = normalizeRoleLabel(role.displayName || role.name);
    user.roleId = role._id;
    user.permissions = explicitOverrides;
    await user.save();

    await createAuditLog(
      req.user,
      "user_role_assigned",
      {
        userId: user._id,
        roleId: role._id,
        roleName: role.displayName || role.name,
      },
      null,
      req,
    );

    return res.status(200).json({
      success: true,
      message: "Role assigned successfully.",
      data: {
        userId: user._id,
        roleId: role._id,
        adminRole: user.adminRole,
      },
    });
  } catch (error) {
    Logger.error("Assign User Role Error", error, {
      userId: req.params?.userId,
      roleId: req.body?.roleId,
      actor: req.user?._id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to assign role.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete invite
 */
export const deleteInvite = async (req, res) => {
  try {
    // Enhanced admin check - only admin can delete invites
    if (!hasAdminActor(req.user)) {
      Logger.error("Delete invite - Access denied", {
        userId: req.user?._id,
        userRole: req.user?.role,
      });
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admin can delete invites.",
      });
    }

    const { inviteId } = req.params;
    Logger.info("Delete invite attempt", { inviteId, userId: req.user?._id });

    const invite = await Invite.findById(inviteId);
    if (!invite) {
      Logger.error("Delete invite - Invite not found", { inviteId });
      return res.status(404).json({
        success: false,
        message: "Invite not found.",
      });
    }

    // Allow deletion of all invitations (pending, accepted, expired)
    // If already cancelled, treat as success (idempotent operation)
    if (invite.status === "cancelled") {
      Logger.warn("Delete invite - Already cancelled", {
        inviteId,
        email: invite.email,
      });
      return res.status(200).json({
        success: true,
        message: "Invitation was already deleted.",
      });
    }

    // Soft delete - mark as cancelled
    invite.status = "cancelled";
    await invite.save();

    await createAuditLog(
      req.user,
      "invite_deleted",
      {
        inviteId: invite._id,
        targetEmail: invite.email,
        originalStatus: invite.status,
      },
      null,
      req,
    );

    Logger.info("Delete invite - Success", { inviteId, email: invite.email });
    return res.status(200).json({
      success: true,
      message: "Invitation deleted successfully.",
    });
  } catch (error) {
    Logger.error("Delete Invite Error", error, {
      inviteId: req.params.inviteId,
      userId: req.user?._id,
    });
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Resend invite
 */
export const resendInvite = async (req, res) => {
  try {
    // Enhanced admin check - only admin can resend invites
    if (!hasAdminActor(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admin can resend invites.",
      });
    }

    const { inviteId } = req.params;

    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found.",
      });
    }

    // Only resend pending or expired invites
    if (invite.status !== "pending" && invite.status !== "expired") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot resend invite. Invite has already been " +
          invite.status +
          ".",
      });
    }

    // Generate new token and extend expiry
    invite.token = Invite.generateToken();
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7); // 7 days from now
    invite.expiresAt = newExpiry;
    invite.status = "pending";
    await invite.save();

    // Send email
    const clientUrl =
      process.env.NODE_ENV === "production"
        ? process.env.PRODUCTION_URL ||
          process.env.CLIENT_URL?.split(",")[0]?.trim()
        : process.env.CLIENT_URL?.split(",")[0]?.trim() ||
          "http://localhost:5173";

    const inviteUrl = `${clientUrl}/accept-invite/${invite.token}`;

    const emailSubject = `Invitation to join ${
      process.env.SITE_NAME || "Sello"
    } Team`;
    const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
                <h2 style="color:#111827;margin-bottom:8px;">You're invited to join ${
                  process.env.SITE_NAME || "Sello"
                }!</h2>
                <p style="margin:0 0 12px 0;">Hi ${invite.fullName},</p>
                <p style="margin:0 0 16px 0;">You have been invited to join our team as a <strong>${
                  invite.role
                }</strong>.</p>
                <p style="margin:0 0 16px 0;">
                    <a href="${inviteUrl}" style="display:inline-block;padding:10px 18px;background:#F97316;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;">
                        Accept Invitation
                    </a>
                </p>
                <p style="margin:0 0 16px 0;">This invitation will expire in 7 days.</p>
                <p style="font-size:12px;color:#6B7280;margin-top:24px;">
                    If you didn't expect this invitation, you can safely ignore this email.
                </p>
            </div>
        `;

    try {
      await sendEmail(invite.email, emailSubject, emailHtml);
    } catch (emailError) {
      Logger.error("Failed to send invite email", emailError, {
        email: invite.email,
      });
      // Continue with success response even if email fails
    }

    await createAuditLog(
      req.user,
      "invite_resent",
      {
        inviteId: invite._id,
        targetEmail: invite.email,
      },
      null,
      req,
    );

    return res.status(200).json({
      success: true,
      message: "Invite resent successfully.",
      data: invite,
    });
  } catch (error) {
    Logger.error("Resend Invite Error", error, {
      inviteId: req.params.inviteId,
      userId: req.user?._id,
    });
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Cancel invite
 */
export const cancelInvite = async (req, res) => {
  try {
    // Enhanced admin check - only admin can cancel invites
    if (!hasAdminActor(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can cancel invites.",
      });
    }

    const { inviteId } = req.params;

    if (!inviteId) {
      return res.status(400).json({
        success: false,
        message: "Invite ID is required.",
      });
    }

    // Find and update invite status
    const invite = await Invite.findByIdAndUpdate(
      inviteId,
      {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: req.user._id,
      },
      { new: true },
    );

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found.",
      });
    }

    // Log the cancellation (non-blocking)
    try {
      await createAuditLog(
        req.user,
        "invite_cancelled",
        {
          inviteId: invite._id,
          targetEmail: invite.email,
          role: invite.role,
        },
        null,
        req,
      );
    } catch (auditError) {
      Logger.error("Audit log error (non-blocking)", auditError);
    }

    // Create in-app notification
    try {
      const notification = await Notification.create({
        title: "Invite Cancelled",
        message: `Invitation for ${invite.email} has been cancelled.`,
        type: "info",
        recipient: req.user._id,
        actionUrl: `/admin/settings?tab=users`,
        actionText: "View Users",
      });

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${req.user._id}`).emit("new-notification", notification);
      }
    } catch (notifError) {
      Logger.error("Notification creation error", notifError);
    }

    return res.status(200).json({
      success: true,
      message: `Invitation for ${invite.email} has been cancelled successfully.`,
      data: {
        inviteId: invite._id,
        email: invite.email,
        role: invite.role,
        cancelledAt: invite.cancelledAt,
      },
    });
  } catch (error) {
    Logger.error("Cancel Invite Error", error, {
      inviteId: req.params.inviteId,
      userId: req.user?._id,
    });
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getAllInvites = async (req, res) => {
  try {
    if (!hasAdminActor(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can view invites.",
      });
    }

    // Get invites with token included (needed for generating invite URLs)
    // Token is not excluded by default, but we explicitly select it to ensure it's included
    // Exclude cancelled invites from the response
    const invites = await Invite.find()
      .select(
        "email fullName phone role roleId permissions token expiresAt status invitedBy acceptedBy acceptedAt createdAt updatedAt",
      )
      .populate("invitedBy", "name email")
      .populate("acceptedBy", "name email")
      .sort({ createdAt: -1 })
      .where({ status: { $ne: "cancelled" } }); // EXCLUDE CANCELLED INVITES

    return res.status(200).json({
      success: true,
      message: "Invites retrieved successfully.",
      data: invites,
    });
  } catch (error) {
    Logger.error("Get All Invites Error", error, { userId: req.user?._id });
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Fix custom roles that incorrectly have isPreset: true
 * This is a temporary fix for existing data
 */
export const fixCustomRoles = async (req, res) => {
  try {
    if (!hasAdminActor(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admin can fix roles.",
      });
    }

    const presetRoleNames = SYSTEM_ROLE_NAMES;
    let rolePresetFixes = 0;
    let roleNameFixes = 0;
    let rolePermissionFixes = 0;
    let userRoleFixes = 0;
    let userPermissionFixes = 0;
    let inviteRoleFixes = 0;
    let invitePermissionFixes = 0;

    const presetFixResult = await Role.updateMany(
      { isPreset: true, name: { $nin: presetRoleNames } },
      { $set: { isPreset: false } },
    );
    rolePresetFixes = presetFixResult.modifiedCount || 0;

    const roles = await Role.find({});
    for (const role of roles) {
      let changed = false;
      const normalizedName = resolveCanonicalRoleName(role.name);
      const normalizedDisplayName = resolveCanonicalRoleName(
        role.displayName || role.name,
      );

      if (normalizedName !== role.name || normalizedDisplayName !== role.displayName) {
        role.name = normalizedName;
        role.displayName = normalizedDisplayName;
        changed = true;
        roleNameFixes += 1;
      }

      const sanitizedRolePerms = sanitizePermissionsInput(role.permissions || {});
      if (
        JSON.stringify(sanitizedRolePerms) !==
        JSON.stringify(role.permissions || {})
      ) {
        role.permissions = sanitizedRolePerms;
        changed = true;
        rolePermissionFixes += 1;
      }

      if (changed) {
        await role.save();
      }
    }

    const adminUsers = await User.find({ role: "admin" });
    for (const user of adminUsers) {
      let changed = false;
      const normalizedAdminRole = resolveCanonicalRoleName(user.adminRole || "");
      if (normalizedAdminRole && normalizedAdminRole !== user.adminRole) {
        user.adminRole = normalizedAdminRole;
        changed = true;
        userRoleFixes += 1;
      }

      const sanitizedUserPerms = sanitizePermissionsInput(user.permissions || {});
      if (JSON.stringify(sanitizedUserPerms) !== JSON.stringify(user.permissions || {})) {
        user.permissions = sanitizedUserPerms;
        changed = true;
        userPermissionFixes += 1;
      }

      if (changed) {
        await user.save();
      }
    }

    const invites = await Invite.find({ status: { $in: ["pending", "expired"] } });
    for (const invite of invites) {
      let changed = false;
      const normalizedInviteRole = resolveCanonicalRoleName(invite.role || "");
      if (normalizedInviteRole && normalizedInviteRole !== invite.role) {
        invite.role = normalizedInviteRole;
        changed = true;
        inviteRoleFixes += 1;
      }

      const sanitizedInvitePerms = sanitizePermissionsInput(invite.permissions || {});
      if (JSON.stringify(sanitizedInvitePerms) !== JSON.stringify(invite.permissions || {})) {
        invite.permissions = sanitizedInvitePerms;
        changed = true;
        invitePermissionFixes += 1;
      }

      if (changed) {
        await invite.save();
      }
    }

    Logger.info("Normalized RBAC data", {
      rolePresetFixes,
      roleNameFixes,
      rolePermissionFixes,
      userRoleFixes,
      userPermissionFixes,
      inviteRoleFixes,
      invitePermissionFixes,
      legacyMap: LEGACY_ROLE_NAME_MAP,
    });

    return res.status(200).json({
      success: true,
      message: "RBAC data normalized successfully.",
      data: {
        rolePresetFixes,
        roleNameFixes,
        rolePermissionFixes,
        userRoleFixes,
        userPermissionFixes,
        inviteRoleFixes,
        invitePermissionFixes,
      },
    });
  } catch (error) {
    Logger.error("Fix Custom Roles Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const getPermissionMatrix = async (req, res) => {
  try {
    if (!hasAdminActor(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can export permission matrix.",
      });
    }

    const roles = await Role.find({ isActive: true }).sort({ name: 1 });

    // Get all permission keys
    const permissionKeys = PERMISSION_KEYS;

    const matrix = roles.map((role) => {
      const row = {
        role: role.name,
        displayName: role.displayName,
        accessLevel: role.accessLevel,
        purpose: role.purpose,
      };

      permissionKeys.forEach((key) => {
        row[key] = role.permissions[key] || false;
      });

      return row;
    });

    return res.status(200).json({
      success: true,
      message: "Permission matrix retrieved successfully.",
      data: {
        matrix,
        roles: roles.map((r) => ({
          id: r._id,
          name: r.name,
          displayName: r.displayName,
          accessLevel: r.accessLevel,
          purpose: r.purpose,
          restrictions: r.restrictions,
        })),
      },
    });
  } catch (error) {
    Logger.error("Get Permission Matrix Error", error, {
      userId: req.user?._id,
    });
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get invite details by token (public endpoint)
 */
export const getInviteByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invite token is required.",
      });
    }

    const invite = await Invite.findOne({ token })
      .populate("invitedBy", "name email")
      .select("-token"); // Don't send token back

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired invitation link.",
      });
    }

    // Check if invite is expired
    if (invite.isExpired()) {
      invite.status = "expired";
      await invite.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message:
          "This invitation has expired. Please contact the administrator for a new invitation.",
      });
    }

    // Check if already accepted
    if (invite.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "This invitation has already been accepted.",
      });
    }

    // Check if cancelled
    if (invite.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This invitation has been cancelled.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invite details retrieved successfully.",
      data: {
        email: invite.email,
        fullName: invite.fullName,
        phone: invite.phone,
        role: invite.role,
        expiresAt: invite.expiresAt,
        invitedBy: invite.invitedBy,
      },
    });
  } catch (error) {
    Logger.error("Get Invite By Token Error", error, {
      token: req.params.token,
    });
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Accept invite and create user account (public endpoint)
 */
export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invite token is required.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required and must be at least 6 characters long.",
      });
    }

    const invite = await Invite.findOne({ token });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invalid invitation link.",
      });
    }

    // Check if invite is expired
    if (invite.isExpired()) {
      invite.status = "expired";
      await invite.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message:
          "This invitation has expired. Please contact the administrator for a new invitation.",
      });
    }

    // Check if already accepted
    if (invite.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "This invitation has already been accepted.",
      });
    }

    // Check if cancelled
    if (invite.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This invitation has been cancelled.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: invite.email.toLowerCase(),
    });
    if (existingUser) {
      if (existingUser.status === "active") {
        return res.status(400).json({
          success: false,
          message:
            "A user with this email already exists. Please login instead.",
        });
      }
      // Inactive/suspended user — reactivate and update with invite data
      existingUser.name = invite.fullName;
      existingUser.phone = invite.phone;
      existingUser.password = await bcrypt.hash(password, 12);
      existingUser.role = "admin";
      existingUser.adminRole = normalizeRoleLabel(invite.role);
      existingUser.roleId = invite.roleId || null;
      existingUser.permissions = sanitizePermissionsInput(
        invite.permissions || {},
      );
      existingUser.status = "active";
      existingUser.verified = true;
      existingUser.isEmailVerified = true;
      existingUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        invite.fullName,
      )}&background=4F46E5&color=fff`;

      const user = await existingUser.save();

      invite.status = "accepted";
      invite.acceptedAt = new Date();
      invite.acceptedBy = user._id;
      await invite.save({ validateBeforeSave: false });

      const jwtToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
      );

      await createAuditLog(
        user,
        "invite_accepted",
        {
          inviteId: invite._id,
          role: invite.role,
          reactivated: true,
        },
        null,
        req,
      );

      return res.status(200).json({
        success: true,
        message:
          "Invitation accepted successfully. Your account has been reactivated.",
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            adminRole: user.adminRole,
            permissions: user.permissions,
            status: user.status,
          },
          token: jwtToken,
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with admin role and permissions
    const user = await User.create({
      name: invite.fullName,
      email: invite.email.toLowerCase(),
      phone: invite.phone,
      password: hashedPassword,
      role: "admin", // All invited users are admins
      adminRole: normalizeRoleLabel(invite.role), // Store normalized admin role
      roleId: invite.roleId || null,
      permissions: sanitizePermissionsInput(invite.permissions || {}),
      status: "active",
      verified: true,
      isEmailVerified: true,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        invite.fullName,
      )}&background=4F46E5&color=fff`,
    });

    // Update invite status
    invite.status = "accepted";
    invite.acceptedAt = new Date();
    invite.acceptedBy = user._id;
    await invite.save({ validateBeforeSave: false });

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    // Log the acceptance
    await createAuditLog(
      user,
      "invite_accepted",
      {
        inviteId: invite._id,
        role: invite.role,
      },
      null,
      req,
    );

    return res.status(201).json({
      success: true,
      message:
        "Invitation accepted successfully. Your account has been created.",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          adminRole: user.adminRole,
          permissions: user.permissions,
          status: user.status,
        },
        token: jwtToken,
      },
    });
  } catch (error) {
    Logger.error("Accept Invite Error", error, { token: req.params.token });

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
