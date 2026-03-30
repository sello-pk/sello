/**
 * Listing image upload limits (cars / auction submit-car).
 * Keep in sync with client constants/listingImages.js and ImagesUpload.jsx
 *
 * Production: If uploads fail after 4–5 images, the reverse proxy (e.g. nginx)
 * is likely limiting request body size. Set body limit to at least 40MB, e.g.:
 *   nginx: client_max_body_size 40m;
 *   Then reload nginx.
 */
export const LISTING_MAX_IMAGES = 15;
/** Total size of all images in one request (bytes) */
export const LISTING_MAX_TOTAL_BYTES = 40 * 1024 * 1024; // 40MB
/** Per-file ceiling for multer (single huge file still capped) */
export const LISTING_MAX_FILE_BYTES = 40 * 1024 * 1024; // 40MB
/** Min request body size for proxy (for docs / error messages) */
export const UPLOAD_PROXY_MIN_BODY_MB = 40;

/** User-facing labels (single source for server error messages) */
export const LISTING_IMAGE_LIMITS_LABEL = `${LISTING_MAX_IMAGES} images max, ${Math.round(LISTING_MAX_TOTAL_BYTES / (1024 * 1024))}MB total per listing`;

export const MSG_IMAGE_TOO_MANY = `Too many images. You can upload up to ${LISTING_MAX_IMAGES} photos per listing. Remove some images and try again.`;

export const MSG_IMAGE_FILE_TOO_LARGE = `One or more files are too large. Each image can be up to ${Math.round(LISTING_MAX_FILE_BYTES / (1024 * 1024))}MB, but all images together must stay within ${Math.round(LISTING_MAX_TOTAL_BYTES / (1024 * 1024))}MB total. Try compressing or resizing your photos.`;

export const MSG_IMAGE_TOTAL_EXCEEDED = `Total image size exceeds ${Math.round(LISTING_MAX_TOTAL_BYTES / (1024 * 1024))}MB per listing. Remove some photos or use smaller/compressed images and try again.`;

export const MSG_IMAGE_TYPE_NOT_ALLOWED = `That file type is not allowed for listing photos. Use JPG, PNG, or WebP only.`;
