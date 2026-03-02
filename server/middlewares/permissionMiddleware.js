import Role from "../models/roleModel.js";
import Logger from "../utils/logger.js";
import {
  SYSTEM_FULL_ACCESS_ROLE_NAMES,
  resolveCanonicalRoleName,
} from "../config/rbacPolicy.js";

const PERMISSION_ALIASES = {
  // Backward compatibility for legacy checks
  manageListings: [
    "approveListings",
    "editListings",
    "deleteListings",
    "featureListings",
  ],
  manageTestimonials: ["viewTestimonials", "manageTestimonials"],
  manageCategories: [
    "manageCategories",
    "createCategories",
    "editCategories",
    "deleteCategories",
  ],
  managePromotions: [
    "managePromotions",
    "createPromotions",
    "editPromotions",
    "deletePromotions",
  ],
};

const hasResolvedPermission = (userPermissions, permission) => {
  if (!permission) return false;
  const aliases = PERMISSION_ALIASES[permission] || [permission];
  return aliases.some((perm) => Boolean(userPermissions?.[perm]));
};

const getUserPermissions = async (user) => {
  if (!user) return {};
  const directPermissions = user.permissions || {};
  if (user.roleId) {
    const role = await Role.findById(user.roleId).lean();
    if (role && role.isActive) {
      return { ...(role.permissions || {}), ...directPermissions };
    }
  }
  return directPermissions;
};

const hasFullAccessRole = async (user) => {
  if (!user || user.role !== "admin") return false;

  const isOriginalAdmin = !user.adminRole && !user.roleId;
  if (isOriginalAdmin) return true;

  const normalizedAdminRole = resolveCanonicalRoleName(user.adminRole || "");
  if (SYSTEM_FULL_ACCESS_ROLE_NAMES.includes(normalizedAdminRole)) {
    return true;
  }

  if (user.roleId) {
    const role = await Role.findById(user.roleId).lean();
    if (!role || !role.isActive) return false;
    const normalizedRoleName = resolveCanonicalRoleName(
      role.displayName || role.name || "",
    );
    return SYSTEM_FULL_ACCESS_ROLE_NAMES.includes(normalizedRoleName);
  }

  return false;
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (await hasFullAccessRole(req.user)) {
        return next();
      }

      // Get user's role and permissions
      const userPermissions = await getUserPermissions(req.user);

      // Check if user has the required permission
      if (!hasResolvedPermission(userPermissions, permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have permission to ${permission}.`,
        });
      }

      next();
    } catch (error) {
      Logger.error("Permission Check Error", error, {
        permission,
        userId: req.user?._id,
      });
      return res.status(500).json({
        success: false,
        message: "Permission check failed. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (await hasFullAccessRole(req.user)) {
        return next();
      }

      // Get user's role and permissions
      const userPermissions = await getUserPermissions(req.user);

      // Check if user has any of the required permissions
      const hasAny = permissions.some((permission) =>
        hasResolvedPermission(userPermissions, permission)
      );

      if (!hasAny) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      Logger.error("Permission Check Error", error, {
        permissions,
        userId: req.user?._id,
      });
      return res.status(500).json({
        success: false,
        message: "Permission check failed. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (await hasFullAccessRole(req.user)) {
        return next();
      }

      // Get user's role and permissions
      const userPermissions = await getUserPermissions(req.user);

      // Check if user has all of the required permissions
      const hasAll = permissions.every(
        (permission) => hasResolvedPermission(userPermissions, permission)
      );

      if (!hasAll) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      Logger.error("Permission Check Error", error, {
        permissions,
        userId: req.user?._id,
      });
      return res.status(500).json({
        success: false,
        message: "Permission check failed. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
};

/**
 * Check if user is Admin
 */
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can perform this action.",
    });
  }
  next();
};
