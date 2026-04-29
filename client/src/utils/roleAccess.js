import {
  FULL_ACCESS_ROLE_NAMES,
  LEGACY_PATH_ALIASES,
  PERMISSION_ROUTE_ACCESS,
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

  const adminRole = normalizeRoleName(user.adminRole || "");
  const hasExplicitPermissions = Object.keys(user.permissions || {}).length > 0;

  // Backward-compatible fallback for legacy full-admin accounts created
  // before adminRole/permission-scoped staff accounts were introduced.
  if (!adminRole && !hasExplicitPermissions) {
    return true;
  }

  return FULL_ACCESS_ROLE_NAMES.includes(adminRole);
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
