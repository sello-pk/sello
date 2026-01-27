import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import Logger from "./logger.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 seconds timeout instead of default
});

/**
 * Upload image to Cloudinary with compression, EXIF removal, and optimization
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {Object} options - Upload options
 * @param {String} options.folder - Cloudinary folder (default: "sello_cars")
 * @param {Boolean} options.removeExif - Remove EXIF data (default: true)
 * @param {Number} options.quality - Image quality 1-100 (default: 80)
 * @param {String} options.format - Output format (default: "auto" for auto format)
 * @returns {Promise<String>} Secure URL of uploaded image
 */
export const uploadCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      folder = "sello_cars",
      removeExif = true,
      quality = 80,
      format = "auto",
    } = options;

    const uploadOptions = {
      folder: folder,
      resource_type: "image",
      // Compression and optimization
      quality: quality,
      fetch_format: format, // auto, jpg, png, webp
      // Remove EXIF data for privacy and smaller file size
      strip_metadata: removeExif,
      // Auto-optimize images
      transformation: [
        {
          quality: "auto:good", // Cloudinary auto quality
          fetch_format: "auto", // Auto format (webp when supported)
        },
      ],
      // Limit image dimensions (optional - adjust as needed)
      // width: 1920,
      // height: 1080,
      // crop: "limit"
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          Logger.error("Cloudinary upload error", error);
          return reject(error);
        }
        resolve(result.secure_url);
      },
    );

    stream.end(fileBuffer); // Send file buffer
  });
};

/**
 * Delete image(s) from Cloudinary
 * @param {String|Array<String>} imageUrls - Single URL or array of URLs to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteCloudinaryImages = async (imageUrls) => {
  try {
    if (!imageUrls || (Array.isArray(imageUrls) && imageUrls.length === 0)) {
      return { deleted: [], failed: [] };
    }

    // Normalize to array
    const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

    // Extract public IDs from Cloudinary URLs
    const extractPublicId = (url) => {
      if (!url || typeof url !== "string") return null;

      try {
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
        // Or: https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{format}
        const urlParts = url.split("/");
        const uploadIndex = urlParts.findIndex((part) => part === "upload");

        if (uploadIndex === -1) return null;

        // Get everything after 'upload' and before the file extension
        const pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");
        const publicId = pathAfterUpload.replace(/\.[^/.]+$/, ""); // Remove file extension

        return publicId;
      } catch (error) {
        Logger.warn("Failed to extract public ID from URL", {
          url,
          error: error.message,
        });
        return null;
      }
    };

    const publicIds = urls.map(extractPublicId).filter((id) => id !== null);

    if (publicIds.length === 0) {
      Logger.warn("No valid Cloudinary public IDs found in URLs", { urls });
      return { deleted: [], failed: urls };
    }

    // Delete images in batch (Cloudinary supports up to 100 at a time)
    const batchSize = 100;
    const deleted = [];
    const failed = [];

    for (let i = 0; i < publicIds.length; i += batchSize) {
      const batch = publicIds.slice(i, i + batchSize);

      try {
        const result = await cloudinary.api.delete_resources(batch, {
          resource_type: "image",
          type: "upload",
        });

        // Cloudinary returns { deleted: { [publicId]: "deleted" }, failed: { [publicId]: "not_found" } }
        if (result.deleted) {
          Object.keys(result.deleted).forEach((publicId) => {
            deleted.push(publicId);
          });
        }

        if (result.failed && Object.keys(result.failed).length > 0) {
          Object.keys(result.failed).forEach((publicId) => {
            failed.push(publicId);
            Logger.warn("Failed to delete image from Cloudinary", {
              publicId,
              reason: result.failed[publicId],
            });
          });
        }
      } catch (error) {
        Logger.error("Error deleting batch from Cloudinary", error, { batch });
        failed.push(...batch);
      }
    }

    return { deleted, failed };
  } catch (error) {
    Logger.error("Error in deleteCloudinaryImages", error, { imageUrls });
    return {
      deleted: [],
      failed: Array.isArray(imageUrls) ? imageUrls : [imageUrls],
    };
  }
};

import fs from "fs";

/**
 * Upload image from file path to Cloudinary (for avatar uploads)
 * @param {String} filePath - Local file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object|null>} Cloudinary result or null
 */
export const uploadOnCloudinary = async (filePath, options = {}) => {
  try {
    if (!filePath) return null;

    const { folder = "avatars", quality = 80, removeExif = true } = options;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "image",
      quality: quality,
      fetch_format: "auto",
      strip_metadata: removeExif,
      transformation: [
        {
          quality: "auto:good",
          fetch_format: "auto",
        },
      ],
    });

    // ✅ Only try to delete local files, not URLs
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        Logger.warn("Failed to delete local file after Cloudinary upload", {
          filePath,
          error: err.message,
        });
      }
    }

    return result;
  } catch (error) {
    // Remove file on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return null;
  }
};

// Image Quality Validation Functions

/**
 * Validate image quality and dimensions
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Validation options
 * @returns {Promise<{valid: boolean, errors: string[], warnings: string[], metadata: object}>}
 */
export const validateImageQuality = async (imageBuffer, options = {}) => {
  const {
    minWidth = 400,
    minHeight = 300,
    maxWidth = 10000,
    maxHeight = 10000,
    minFileSize = 10000, // 10KB minimum
    maxFileSize = 10 * 1024 * 1024, // 10MB maximum
    minAspectRatio = 0.5,
    maxAspectRatio = 3.0,
  } = options;

  const errors = [];
  const warnings = [];
  let metadata = {};

  try {
    // Try to use sharp if available, otherwise use basic validation
    let sharp;
    try {
      sharp = (await import("sharp")).default;
    } catch (err) {
      // Sharp not available, use basic validation
      return validateImageBasic(imageBuffer, { minFileSize, maxFileSize });
    }

    // Get image metadata using sharp
    const image = sharp(imageBuffer);
    metadata = await image.metadata();

    // Check file size
    if (imageBuffer.length < minFileSize) {
      errors.push(
        `Image too small (${(imageBuffer.length / 1024).toFixed(1)}KB). Minimum: ${(minFileSize / 1024).toFixed(1)}KB`,
      );
    }

    if (imageBuffer.length > maxFileSize) {
      errors.push(
        `Image too large (${(imageBuffer.length / 1024 / 1024).toFixed(1)}MB). Maximum: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`,
      );
    }

    // Check dimensions
    if (metadata.width && metadata.height) {
      if (metadata.width < minWidth || metadata.height < minHeight) {
        errors.push(
          `Image dimensions too small (${metadata.width}x${metadata.height}). Minimum: ${minWidth}x${minHeight}`,
        );
      }

      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        warnings.push(
          `Image dimensions very large (${metadata.width}x${metadata.height}). May take longer to upload.`,
        );
      }

      // Check aspect ratio (too narrow or too wide might be wrong orientation)
      const aspectRatio = metadata.width / metadata.height;
      if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
        warnings.push(
          `Unusual aspect ratio (${aspectRatio.toFixed(2)}). Image may be rotated incorrectly.`,
        );
      }

      // Check if image is too square (might be a thumbnail)
      if (Math.abs(aspectRatio - 1.0) < 0.1 && metadata.width < 800) {
        warnings.push(
          "Image appears to be square and small. Consider using a wider landscape photo.",
        );
      }
    } else {
      warnings.push(
        "Could not determine image dimensions. Image may be corrupted.",
      );
    }

    // Check format
    if (
      !metadata.format ||
      !["jpeg", "jpg", "png", "webp"].includes(metadata.format.toLowerCase())
    ) {
      errors.push(
        `Unsupported image format: ${metadata.format || "unknown"}. Use JPEG, PNG, or WebP.`,
      );
    }

    // Basic quality heuristics
    // Very small file size relative to dimensions might indicate low quality
    if (metadata.width && metadata.height && imageBuffer.length) {
      const pixels = metadata.width * metadata.height;
      const bytesPerPixel = imageBuffer.length / pixels;

      if (bytesPerPixel < 0.5) {
        warnings.push("Image may be low quality or heavily compressed.");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: imageBuffer.length,
        aspectRatio:
          metadata.width && metadata.height
            ? (metadata.width / metadata.height).toFixed(2)
            : null,
      },
    };
  } catch (error) {
    // If sharp fails, fall back to basic validation
    return validateImageBasic(imageBuffer, { minFileSize, maxFileSize });
  }
};

/**
 * Basic image validation without sharp (fallback)
 */
const validateImageBasic = (imageBuffer, options = {}) => {
  const { minFileSize = 10000, maxFileSize = 10 * 1024 * 1024 } = options;

  const errors = [];
  const warnings = [];

  // Check file size
  if (imageBuffer.length < minFileSize) {
    errors.push(
      `Image too small (${(imageBuffer.length / 1024).toFixed(1)}KB). Minimum: ${(minFileSize / 1024).toFixed(1)}KB`,
    );
  }

  if (imageBuffer.length > maxFileSize) {
    errors.push(
      `Image too large (${(imageBuffer.length / 1024 / 1024).toFixed(1)}MB). Maximum: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`,
    );
  }

  // Basic magic number check for image formats
  const header = imageBuffer.slice(0, 4);
  const isJPEG = header[0] === 0xff && header[1] === 0xd8;
  const isPNG =
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47;
  const isWebP =
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46;

  if (!isJPEG && !isPNG && !isWebP) {
    errors.push("Invalid image format. Use JPEG, PNG, or WebP.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      size: imageBuffer.length,
      format: isJPEG ? "jpeg" : isPNG ? "png" : isWebP ? "webp" : "unknown",
    },
  };
};

/**
 * Validate multiple images and return aggregate results
 */
export const validateMultipleImages = async (imageBuffers, options = {}) => {
  const results = await Promise.all(
    imageBuffers.map((buffer) => validateImageQuality(buffer, options)),
  );

  const allErrors = [];
  const allWarnings = [];
  let allValid = true;

  results.forEach((result, index) => {
    if (!result.valid) {
      allValid = false;
    }
    if (result.errors.length > 0) {
      allErrors.push(`Image ${index + 1}: ${result.errors.join(", ")}`);
    }
    if (result.warnings.length > 0) {
      allWarnings.push(`Image ${index + 1}: ${result.warnings.join(", ")}`);
    }
  });

  return {
    valid: allValid,
    errors: allErrors,
    warnings: allWarnings,
    results: results,
  };
};
