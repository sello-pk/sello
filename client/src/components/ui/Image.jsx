import React, { useState, useEffect, useRef } from "react";
import { optimizeCloudinaryUrl, generateCloudinarySrcSet } from "../../utils/imageUtils";

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
  responsive = false,
  sizes = "100vw",
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(() => !lazy);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  const onErrorRef = useRef(onError);
  const cloudinaryOptionsRef = useRef(cloudinaryOptions);
  onErrorRef.current = onError;
  cloudinaryOptionsRef.current = cloudinaryOptions;

  useEffect(() => {
    if (!src || src === "") {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const optimizedSrc =
      optimizeCloudinary && src?.includes("cloudinary.com")
        ? optimizeCloudinaryUrl(src, cloudinaryOptionsRef.current)
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
      try {
        onErrorRef.current?.();
      } catch {}
    };
    img.src = optimizedSrc;
  }, [src, lazy, optimizeCloudinary]);

  const srcSet =
    responsive && src?.includes("cloudinary.com")
      ? generateCloudinarySrcSet(
          src,
          cloudinaryOptions.responsiveSizes || [200, 300, 400, 600],
        )
      : undefined;

  if (isLoading && placeholder) {
    return placeholder;
  }

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

  if (isLoading) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
        style={{ width, height }}
        {...props}
      />
    );
  }

  return (
    <img
      src={imgSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      onLoad={() => setIsLoading(false)}
      onError={(e) => {
        setHasError(true);
        setIsLoading(false);
        onErrorRef.current?.(e);
      }}
      {...props}
    />
  );
};

// Re-export as LazyImage for backward compatibility
export { Image as LazyImage };
export { Image };
export default Image;
