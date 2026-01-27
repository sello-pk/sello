/**
 * Consolidated Formatting Utilities
 * All formatting functions in one place
 */

/**
 * Format price with commas and currency symbol
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return "N/A";

  // Convert to number if it's a string
  const numPrice = typeof price === "string" ? parseFloat(price) : price;

  // Check if the conversion was successful
  if (isNaN(numPrice)) return "N/A";

  // Format the number with commas
  const formattedNumber = numPrice.toLocaleString();

  // Return with currency symbol
  return `${formattedNumber}`;
};

/**
 * Format mileage with commas
 * @param {number} mileage - The mileage to format
 * @returns {string} Formatted mileage string
 */
export const formatMileage = (mileage) => {
  if (mileage === null || mileage === undefined) return "N/A";
  return mileage.toLocaleString("en-US") + " km";
};

/**
 * Format date to a readable format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format date for export
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string for export
 */
export const formatDateForExport = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * Format currency for export
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrencyForExport = (amount, currency = "USD") => {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Format phone number
 * @param {string} phone - Phone number string
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone; // Return original if can't format
};

// Re-export all functions for backward compatibility
export default {
  formatPrice,
  formatMileage,
  formatDate,
  formatDateForExport,
  formatCurrencyForExport,
  formatFileSize,
  formatPhoneNumber,
};
