import User from "../models/userModel.js";
import Role from "../models/roleModel.js";
import Logger from "../utils/logger.js";

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

/**
 * Check if user has specific permission
 */
export const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Only give full access to original admins (no adminRole set and no roleId set)
      const isOriginalAdmin =
        req.user.role === "admin" && !req.user.adminRole && !req.user.roleId;

      if (isOriginalAdmin) {
        return next();
      }

      // Check if user has Super Admin role via roleId
      if (req.user.roleId) {
        const role = await Role.findById(req.user.roleId);
        if (role && role.isActive && role.name === "Super Admin") {
          return next(); // Super Admin gets full access
        }
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
      // Only give full access to original admins (no adminRole set and no roleId set)
      const isOriginalAdmin =
        req.user.role === "admin" && !req.user.adminRole && !req.user.roleId;

      if (isOriginalAdmin) {
        return next();
      }

      // Check if user has Super Admin role via roleId
      if (req.user.roleId) {
        const role = await Role.findById(req.user.roleId);
        if (role && role.isActive && role.name === "Super Admin") {
          return next(); // Super Admin gets full access
        }
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
      // Only give full access to original admins (no adminRole set and no roleId set)
      const isOriginalAdmin =
        req.user.role === "admin" && !req.user.adminRole && !req.user.roleId;

      if (isOriginalAdmin) {
        return next();
      }

      // Check if user has Super Admin role via roleId
      if (req.user.roleId) {
        const role = await Role.findById(req.user.roleId);
        if (role && role.isActive && role.name === "Super Admin") {
          return next(); // Super Admin gets full access
        }
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
