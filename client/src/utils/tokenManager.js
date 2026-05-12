/**
 * Centralized token + session management.
 * Refresh token is httpOnly on server; access token in localStorage (SPA tradeoff).
 * Logout / login-as-other-user must reset RTK caches or getMe keeps showing previous user.
 */
import { getAccessToken, setAccessToken, clearTokens } from "./tokenRefresh.js";
import { invalidateAuthCaches } from "./authCacheInvalidate.js";

const USER_STORAGE_KEY = "user";

/**
 * Wipe client auth state and invalidate only auth/user-related cache.
 * Does NOT reset entire API state, so public data (brands, blogs, listings) stays cached
 * and "No brands" / empty sections after refresh failure or logout are avoided.
 */
export function clearAuthSession() {
  clearTokens();
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // ignore
  }
  invalidateAuthCaches();
}

/**
 * Persist new session after login; invalidate user cache so getMe refetches and UI shows current user.
 */
export function applyLoginSession(accessToken, user) {
  if (accessToken) {
    setAccessToken(accessToken);
  }
  if (user) {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  }
  invalidateAuthCaches();
}

/**
 * Check if access token is expired (client-side check)
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return true;
    return false;
  } catch {
    return true;
  }
};

export const getValidAccessToken = () => {
  const token = getAccessToken();
  if (!token) return null;
  if (isTokenExpired(token)) {
    clearTokens();
    return null;
  }
  return token;
};

export const isAuthenticated = () => !!getValidAccessToken();

export const getUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const clearAuth = () => clearAuthSession();

export const storeAuth = (accessToken, _refreshToken, user) => {
  applyLoginSession(accessToken, user);
};

export default {
  isTokenExpired,
  getValidAccessToken,
  isAuthenticated,
  getUser,
  clearAuth,
  storeAuth,
  clearAuthSession,
  applyLoginSession,
  getAccessToken,
  setAccessToken,
  clearTokens,
};
