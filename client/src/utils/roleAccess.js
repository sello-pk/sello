import {
  FULL_ACCESS_ROLE_NAMES,
  LEGACY_PATH_ALIASES,
  PERMISSION_ROUTE_ACCESS,
  SYSTEM_ROLE_NAMES,
} from "../constants/rbacPolicy";

const LEGACY_ROLE_NAME_MAP = {
  "Marketing Team": "Marketing Manager",
  "Blogs/Content Agent": "Content Writer",
  Moderator: "Listings Moderator",
  "Dealer Manager": "Listings Moderator",
  "Super Admin": "Owner",
};

const normalizeRoleName = (roleName = "") =>
  LEGACY_ROLE_NAME_MAP[roleName] || roleName;

const resolvePathAlias = (path = "") => LEGACY_PATH_ALIASES[path] || path;

const hasAnyPermission = (userPermissions = {}, keys = []) =>
  keys.some((key) => Boolean(userPermissions?.[key]));

export const isSuperAdmin = (user) => {
  if (!user || user.role !== "admin") return false;
  if (!user.adminRole) return true;

  const normalizedRole = normalizeRoleName(user.adminRole);
  if (FULL_ACCESS_ROLE_NAMES.includes(normalizedRole)) return true;

  // Keep legacy/main admins (no roleId + non-system role label) fully accessible.
  if (!user.roleId && !SYSTEM_ROLE_NAMES.includes(normalizedRole)) return true;

  return false;
};

export const getAllowedMenuPaths = (user) => {
  if (!user || user.role !== "admin") return [];
  if (isSuperAdmin(user)) return Object.keys(PERMISSION_ROUTE_ACCESS);

  const userPermissions = user.permissions || {};
  return Object.entries(PERMISSION_ROUTE_ACCESS)
    .filter(([, keys]) => hasAnyPermission(userPermissions, keys))
    .map(([path]) => path);
};

export const canAccessMenu = (user, rawPath) => {
  if (!user || user.role !== "admin") return false;
  if (isSuperAdmin(user)) return true;

  const path = resolvePathAlias(rawPath);
  const userPermissions = user.permissions || {};

  if (Object.prototype.hasOwnProperty.call(PERMISSION_ROUTE_ACCESS, path)) {
    return hasAnyPermission(userPermissions, PERMISSION_ROUTE_ACCESS[path]);
  }

  for (const [basePath, keys] of Object.entries(PERMISSION_ROUTE_ACCESS)) {
    if (path.startsWith(`${basePath}/`)) {
      return hasAnyPermission(userPermissions, keys);
    }
  }

  return false;
};

export default { isSuperAdmin, getAllowedMenuPaths, canAccessMenu };
