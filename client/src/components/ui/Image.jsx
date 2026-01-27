import React, { useState, useEffect } from "react";

/**
 * Unified Image Component
 * Includes lazy loading and error handling
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

    setIsLoading(true);
    setHasError(false);
    setImgSrc(src);

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
      img.src = src;
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
  }, [src, lazy, onError]);

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
      style={{ width, height }}
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
