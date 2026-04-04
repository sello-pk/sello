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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    if (!src || src === "") {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Optimize Cloudinary URLs if enabled
    const optimizedSrc = optimizeCloudinary && src?.includes('cloudinary.com')
      ? optimizeCloudinaryUrl(src, cloudinaryOptions)
      : src;

    setIsLoading(true);
    setHasError(false);
    setImgSrc(optimizedSrc);

    const loadImage = () => {
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
    };

    if (lazy) {
      // Create intersection observer to load image when in viewport
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 },
      );

      // Observe a temporary element
      const tempElement = document.createElement("div");
      observer.observe(tempElement);

      return () => {
        observer.disconnect();
      };
    } else {
      loadImage();
    }
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
