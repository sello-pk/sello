/**
 * Fix image URL format by adding protocol if missing
 * @param {string} imageUrl - The image URL from database
 * @returns {string} - Fixed image URL with proper protocol
 */
export const fixImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  // If URL already has protocol, return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If URL starts with //, add https:
  if (imageUrl.startsWith("//")) {
    return `https:${imageUrl}`;
  }

  // If URL has no protocol, add https://
  return `https://${imageUrl}`;
};
