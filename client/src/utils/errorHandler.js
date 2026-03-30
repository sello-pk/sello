/**
 * Standardized Error Handling Utility
 * Provides consistent error handling across the admin panel
 */

import { notifyError } from "./notifications";

/**
 * Extract error message from various error formats
 * @param {Error|Object} error - Error object from API or exception
 * @returns {string} Human-readable error message
 */
export const getErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred";

  if (error?.data?.message) {
    return error.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    error?.status === "FETCH_ERROR" ||
    error?.error === "TypeError: Failed to fetch"
  ) {
    if (error?.data?.message) return error.data.message;
    return "Request couldn't complete. This usually happens if the upload is too large or your connection is unstable. Try fewer or smaller images.";
  }

  if (error?.status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (error?.status === 403) {
    return "You don't have permission to do this.";
  }

  if (error?.status === 404) {
    return "We couldn't find what you're looking for.";
  }

  if (error?.status === 413 || error?.originalStatus === 413) {
    return "Images are too large for the server. Use fewer or smaller photos and keep the total under 40MB, then try again.";
  }

  if (error?.status === 502 || error?.status === 503) {
    const msg = error?.data?.message;
    if (msg && typeof msg === "string") return msg;
    return "Service temporarily unavailable. Please try again in a moment or upload fewer images.";
  }

  if (error?.status === 500) {
    return "Something went wrong on our end. Please try again in a moment.";
  }

  return "Something went wrong. Please try again.";
};

export const handleApiError = (error, options = {}) => {
  const {
    onError,
    showNotification = true,
    defaultMessage = "An error occurred. Please try again.",
    endpoint,
    ...metadata
  } = options;

  const errorMessage = getErrorMessage(error) || defaultMessage;

  if (onError && typeof onError === "function") {
    onError(error, errorMessage);
  }

  if (showNotification) {
    notifyError(errorMessage);
  }

  if (import.meta.env.DEV) {
    // API Error logged for development
  }

  return errorMessage;
};

export const handleValidationErrors = (errors, setFieldError) => {
  if (!errors || typeof errors !== "object") return;

  Object.keys(errors).forEach((field) => {
    const errorMessage = Array.isArray(errors[field])
      ? errors[field][0]
      : errors[field];

    if (setFieldError) {
      setFieldError(field, errorMessage);
    }
  });
};

export const formatErrorBoundaryError = (error, errorInfo) => {
  return {
    message: error?.message || "An unexpected error occurred",
    stack: error?.stack,
    componentStack: errorInfo?.componentStack,
    timestamp: new Date().toISOString(),
  };
};

export const isNetworkError = (error) => {
  return (
    error?.status === "FETCH_ERROR" ||
    error?.error === "TypeError: Failed to fetch" ||
    error?.message?.includes("Failed to fetch") ||
    error?.message?.includes("NetworkError")
  );
};

export const isAuthError = (error) => {
  return error?.status === 401 || error?.status === 403;
};

export const retryApiCall = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (isAuthError(error) || (error?.status >= 400 && error?.status < 500)) {
        throw error;
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
};

export default {
  getErrorMessage,
  isNetworkError,
  isAuthError,
  formatErrorBoundaryError,
};
