/**
 * Listing image limits — keep in sync with server constants/listingUpload.js
 */
export const LISTING_MAX_IMAGES = 15;
export const LISTING_MAX_TOTAL_MB = 35;
export const LISTING_MAX_FILE_MB = 35;

export const MSG_NO_IMAGES =
  "Add at least one photo. Up to 15 images, 35MB total per listing.";

export const MSG_INVALID_TYPE =
  "Only JPG, PNG, and WebP are allowed for listing photos.";

export function msgFileTooLarge(fileName) {
  return `"${fileName}" is too large. Max ${LISTING_MAX_FILE_MB}MB per file.`;
}

export function msgTooManyImages(remainingSlots) {
  if (remainingSlots > 0) {
    return `Only ${remainingSlots} more photo(s) allowed (max ${LISTING_MAX_IMAGES} per listing).`;
  }
  return `Maximum ${LISTING_MAX_IMAGES} photos per listing. Remove some to add more.`;
}

export function msgTotalExceeded() {
  return `Total size exceeds ${LISTING_MAX_TOTAL_MB}MB for this listing. Remove photos or use smaller images.`;
}

export const MSG_FITTED_PARTIAL =
  "Some photos were skipped so the total stays under 35MB.";
