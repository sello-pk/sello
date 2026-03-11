/**
 * Centralized token + session management.
 * Refresh token is httpOnly on server; access token in localStorage (SPA tradeoff).
 * Logout / login-as-other-user must reset RTK caches or getMe keeps showing previous user.
 */
import { getAccessToken, setAccessToken, clearTokens } from "./tokenRefresh.js";
import { store } from "../redux/store.js";
import { api } from "../redux/services/api.js";
import { adminApi } from "../redux/services/adminApi.js";

const USER_STORAGE_KEY = "user";

/**
 * Wipe client auth state and all RTK Query caches (same as full logout on client).
 */
export function clearAuthSession() {
  clearTokens();
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // ignore
  }
  try {
    store.dispatch(api.util.resetApiState());
  } catch {
    // ignore
  }
  try {
    store.dispatch(adminApi.util.resetApiState());
  } catch {
    // ignore
  }
}

/**
 * Persist new session after login; resets caches so UI shows current user only.
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
  try {
    store.dispatch(api.util.resetApiState());
  } catch {
    // ignore
  }
  try {
    store.dispatch(adminApi.util.resetApiState());
  } catch {
    // ignore
  }
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
