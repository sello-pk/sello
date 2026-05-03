import React, { useState, useEffect } from "react";
import { optimizeCloudinaryUrl } from "../../utils/imageUtils";

/**
 * Unified Image Component
 * Includes lazy loading, error handling, and Cloudinary optimization
 */
const Image = ({
  src,
  alt = "",
  className = "",
  width,
  height,
  onError,
  lazy = false,
  placeholder = null,
  optimizeCloudinary = true,
  cloudinaryOptions = {},
  ...props
}) => {
  // Lazy images use native loading="lazy" + dimensions from props/parent (CLS-safe).
  // Non-lazy preload decode before paint to reduce flash inside fixed-aspect wrappers.
  const [isLoading, setIsLoading] = useState(() => !lazy);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    if (!src || src === "") {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const optimizedSrc =
      optimizeCloudinary && src?.includes("cloudinary.com")
        ? optimizeCloudinaryUrl(src, cloudinaryOptions)
        : src;

    setImgSrc(optimizedSrc);
    setHasError(false);

    if (lazy) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const img = new window.Image();
    img.onload = () => {
      setIsLoading(false);
      setHasError(false);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      if (onError) onError();
    };
    img.src = optimizedSrc;
  }, [src, lazy, onError, optimizeCloudinary, cloudinaryOptions]);

  // Show placeholder while loading
  if (isLoading && placeholder) {
    return placeholder;
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}
        style={{ width, height }}
        {...props}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
        style={{ width, height }}
        {...props}
      />
    );
  }

  // Show actual image
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
        if (onError) onError();
      }}
      {...props}
    />
  );
};

// Re-export as LazyImage for backward compatibility
export { Image as LazyImage };
export { Image };
export default Image;
