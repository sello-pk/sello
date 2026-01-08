import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({
  src,
  alt = '',
  className = '',
  width,
  height,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!src || src === '') {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Create intersection observer to load image when in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.src = src;
            
            img.onload = () => {
              setIsLoading(false);
              setImgSrc(src);
              if (imgRef.current) {
                imgRef.current.src = src;
              }
            };

            img.onerror = (e) => {
              setHasError(true);
              if (onError) onError(e);
            };

            // Cleanup
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading when within 200px of viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, onError]);

  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{
          width: width || '100%',
          height: height || '100%',
          minHeight: height || '100px'
        }}
      >
        <span className="text-gray-400 text-xs">Image not available</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      style={{
        width: width || '100%',
        height: height || '100%',
        minHeight: height || '100px'
      }}
    >
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse rounded"
          style={{
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      )}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        onError={(e) => {
          setHasError(true);
          if (onError) onError(e);
        }}
        {...props}
      />
    </div>
  );
};

// Add shimmer animation to global styles
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
document.head.appendChild(style);

export default LazyImage;
