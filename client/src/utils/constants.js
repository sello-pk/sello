/**
 * Consolidated Application Constants
 * All application constants in one place
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["jpg", "jpeg", "png", "gif", "webp"],
  ALLOWED_DOCUMENT_TYPES: ["pdf", "doc", "docx"],
  ALLOWED_VIDEO_TYPES: ["mp4", "webm", "mov"],
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// Form Validation Configuration
export const VALIDATION_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
};

// UI Configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
  LOADING_TIMEOUT: 10000,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "language",
  RECENTLY_VIEWED: "recentlyViewed",
  SAVED_SEARCHES: "savedSearches",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  AUTH_ERROR: "Authentication failed. Please login again.",
  VALIDATION_ERROR: "Please check your input and try again.",
  FILE_TOO_LARGE: "File size exceeds the maximum allowed size.",
  INVALID_FILE_TYPE: "Invalid file type. Please upload a valid file.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully",
  PASSWORD_CHANGED: "Password changed successfully",
  FILE_UPLOADED: "File uploaded successfully",
  DATA_SAVED: "Data saved successfully",
  ACTION_COMPLETED: "Action completed successfully",
};

// Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// User Roles
export const USER_ROLES = {
  INDIVIDUAL: "individual",
  DEALER: "dealer",
  ADMIN: "admin",
};

// Car Status
export const CAR_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SOLD: "sold",
  PENDING: "pending",
  REJECTED: "rejected",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  INPUT: "YYYY-MM-DD",
  TIME: "h:mm A",
  DATETIME: "MMM DD, YYYY h:mm A",
};

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$|^\+1\d{10}$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/.+/,
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
};

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 10,
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  DEBOUNCE_DELAY: 300,
};

// Environment Variables
export const ENV = {
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  API_URL: import.meta.env.VITE_API_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME || "Sello",
};

// Re-export all constants for backward compatibility
export default {
  API_CONFIG,
  FILE_CONFIG,
  PAGINATION_CONFIG,
  VALIDATION_CONFIG,
  UI_CONFIG,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STATUS_CODES,
  USER_ROLES,
  CAR_STATUS,
  NOTIFICATION_TYPES,
  DATE_FORMATS,
  REGEX_PATTERNS,
  DEFAULTS,
  ENV,
};
