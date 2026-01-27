/**
 * Consolidated API Helper Utilities
 * All API-related helper functions in one place
 */

/**
 * Extract error message from various error formats
 * @param {Error|Object} error - Error object from API or exception
 * @returns {string} Human-readable error message
 */
export const getErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred";

  // RTK Query error format
  if (error?.data?.message) {
    return error.data.message;
  }

  // Standard error object
  if (error?.message) {
    return error.message;
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  // Network error
  if (error?.status === "FETCH_ERROR") {
    return "Network error. Please check your connection.";
  }

  // HTTP status error
  if (error?.status) {
    const statusMessages = {
      400: "Bad request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not found",
      500: "Server error",
      502: "Bad gateway",
      503: "Service unavailable",
    };

    return statusMessages[error.status] || `HTTP ${error.status} error`;
  }

  return "An unexpected error occurred";
};

/**
 * Check if error is a network error
 * @param {Error|Object} error - Error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return (
    error?.status === "FETCH_ERROR" ||
    error?.code === "NETWORK_ERROR" ||
    error?.message?.includes("Network Error") ||
    error?.message?.includes("Failed to fetch")
  );
};

/**
 * Check if error is an authentication error
 * @param {Error|Object} error - Error object
 * @returns {boolean} True if auth error
 */
export const isAuthError = (error) => {
  const status = error?.status || error?.originalStatus;
  return status === 401 || status === 403;
};

/**
 * Create API request configuration
 * @param {Object} options - Request options
 * @returns {Object} Request configuration
 */
export const createRequestConfig = (options = {}) => {
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise} Parsed response data
 */
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      data: errorData,
      message: errorData.message || `HTTP ${response.status}`,
    };
  }

  return response.json();
};

/**
 * Retry failed request
 * @param {Function} requestFn - Request function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} Request result
 */
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry on auth errors or 4xx errors
      if (isAuthError(error) || (error.status >= 400 && error.status < 500)) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i)),
        );
      }
    }
  }

  throw lastError;
};

/**
 * Create query string from object
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
export const createQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString();
};

/**
 * Parse API response data
 * @param {Object} data - Response data
 * @param {string} dataKey - Key to extract data from
 * @returns {any} Parsed data
 */
export const parseResponseData = (data, dataKey = "data") => {
  if (!data) return null;

  // Handle nested data structure
  if (data[dataKey]) {
    return data[dataKey];
  }

  // Handle direct data
  if (data.data) {
    return data.data;
  }

  return data;
};

// Re-export all functions for backward compatibility
export default {
  getErrorMessage,
  isNetworkError,
  isAuthError,
  createRequestConfig,
  handleApiResponse,
  retryRequest,
  createQueryString,
  parseResponseData,
};
