/**
 * Consolidated Validation Utilities
 * All validation functions in one place
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const validatePhone = (phone) => {
  if (!phone) return false;

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if it's a valid phone number (10 or 11 digits)
  return (
    cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith("1"))
  );
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters",
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  return { isValid: true, message: "Password is valid" };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !isNaN(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;

  return !!value;
};

/**
 * Validate number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if valid
 */
export const validateNumberRange = (value, min, max) => {
  if (typeof value !== "number" || isNaN(value)) return false;
  return value >= min && value <= max;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export const validateURL = (url) => {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {boolean} True if valid
 */
export const validateFileSize = (fileSize, maxSize) => {
  return fileSize <= maxSize;
};

/**
 * Validate file type
 * @param {string} fileName - File name
 * @param {Array} allowedTypes - Array of allowed file extensions
 * @returns {boolean} True if valid
 */
export const validateFileType = (fileName, allowedTypes) => {
  if (!fileName || !allowedTypes || !Array.isArray(allowedTypes)) {
    return false;
  }

  const extension = fileName.split(".").pop().toLowerCase();
  return allowedTypes.includes(extension);
};

// Re-export all functions for backward compatibility
export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
  validateNumberRange,
  validateURL,
  validateFileSize,
  validateFileType,
};
