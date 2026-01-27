/**
 * Consolidated Utils Barrel Export
 * Single entry point for all utility functions
 */

// Formatters
export {
  formatPrice,
  formatMileage,
  formatDate,
  formatDateForExport,
  formatCurrencyForExport,
  formatFileSize,
  formatPhoneNumber,
} from "./formatters.js";

// Validators
export {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
  validateNumberRange,
  validateURL,
  validateFileSize,
  validateFileType,
} from "./validators.js";

// API Helpers
export {
  getErrorMessage,
  isNetworkError,
  isAuthError,
  createRequestConfig,
  handleApiResponse,
  retryRequest,
  createQueryString,
  parseResponseData,
} from "./apiHelpers.js";

// Constants
export {
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
} from "./constants.js";

// Re-export other existing utils that don't need consolidation
export { default as logger } from "./logger.js";
export { default as tokenManager } from "./tokenManager.js";
export { default as tokenRefresh } from "./tokenRefresh.js";
export { default as urlBuilders } from "./urlBuilders.js";
export { default as roleAccess } from "./roleAccess.js";
export { default as notifications } from "./notifications.js";
export { default as errorHandler } from "./errorHandler.js";
export { default as secureAPI } from "./secureAPI.js";
export { default as mapsService } from "./mapsService.js";
export { default as imageOptimization } from "./imageOptimization.js";
export { default as keyboardNavigation } from "./keyboardNavigation.js";
export { default as lazyImports } from "./lazyImports.js";
export { default as exportUtils } from "./exportUtils.js";
export { default as colors } from "./colors.js";
export { default as colorContrast } from "./colorContrast.js";
export { default as spacing } from "./spacing.js";
export { default as vehicleFieldConfig } from "./vehicleFieldConfig.js";
