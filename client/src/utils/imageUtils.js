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

// Simple image optimization utilities
export const getOptimizedImageUrl = (url, options = {}) => {
  const { width, height, quality = 80 } = options;
  
  if (!url) return url;
  if (url.includes('?')) return url;
  
  const params = new URLSearchParams();
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  params.append('q', quality);
  
  return `${url}?${params.toString()}`;
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = reject;
  });
};

// Cloudinary optimization function
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 400,
    height = 267,
    crop = 'fill',
    quality = 85,
    format = 'auto'
  } = options;

  // Extract the base URL and public ID
  const urlParts = url.split('/upload/');
  if (urlParts.length < 2) return url;

  const baseUrl = urlParts[0] + '/upload/';
  const publicIdWithFolder = urlParts[1];

  // Build transformation parameters
  const transformations = [
    `f_${format}`,
    `q_auto:eco`, // Use eco mode for better compression
    `c_${crop}`,
    `w_${width}`,
    `h_${height}`,
    `e_sharpen` // Add sharpening filter for better clarity
  ];

  return `${baseUrl}${transformations.join(',')}/${publicIdWithFolder}`;
};
