/**
 * Fix image URL format by adding protocol if missing
 * @param {string} imageUrl - The image URL from database
 * @returns {string} - Fixed image URL with proper protocol
 */
export const fixImageUrl = (imageUrl) => {
  console.log("fixImageUrl - Input:", imageUrl);

  if (!imageUrl) {
    console.log("fixImageUrl - No image URL provided");
    return null;
  }

  // If URL already has protocol, return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    console.log("fixImageUrl - URL already has protocol:", imageUrl);
    return imageUrl;
  }

  // If URL starts with //, add https:
  if (imageUrl.startsWith("//")) {
    const fixedUrl = `https:${imageUrl}`;
    console.log("fixImageUrl - Fixed // to https:", fixedUrl);
    return fixedUrl;
  }

  // If URL has no protocol, add https://
  const fixedUrl = `https://${imageUrl}`;
  console.log("fixImageUrl - Added https:// protocol:", fixedUrl);
  return fixedUrl;
};
