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
    width = 300,
    height = 200,
    crop = 'fill',
    format = 'auto',
    sharpen = false,
  } = options;

  // Extract the base URL and public ID
  const urlParts = url.split('/upload/');
  if (urlParts.length < 2) return url;

  const baseUrl = urlParts[0] + '/upload/';
  const publicIdWithFolder = urlParts[1];

  // Build transformation parameters
  const transformations = [
    `f_${format}`,
    `q_auto:eco`,
    `c_${crop}`,
    `w_${width}`,
    `h_${height}`,
  ];
  if (sharpen) transformations.push(`e_sharpen`);

  return `${baseUrl}${transformations.join(',')}/${publicIdWithFolder}`;
};

export const generateCloudinarySrcSet = (url, sizes = [200, 300, 400, 600]) => {
  if (!url || !url.includes('cloudinary.com')) return '';
  return sizes
    .map((w) => {
      const optUrl = optimizeCloudinaryUrl(url, { width: w, height: Math.round(w * 0.667) });
      return `${optUrl} ${w}w`;
    })
    .join(', ');
};
