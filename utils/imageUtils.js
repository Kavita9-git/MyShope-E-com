/**
 * Image utility functions for handling remote image URLs with hybrid storage support
 */

const BASE_SERVER_URL = 'https://nodejsapp-hfpl.onrender.com';

/**
 * Formats image URL to ensure proper loading in production builds
 * @param {string} imageUrl - The image URL from the server
 * @returns {string} - Properly formatted image URL
 */
export const formatImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  // If the URL is already absolute (starts with http/https), use it as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If the URL starts with '/', it's a relative path from the server root
  if (imageUrl.startsWith('/')) {
    return `${BASE_SERVER_URL}${imageUrl}`;
  }

  // Otherwise, assume it's a relative path and prepend the base URL
  return `${BASE_SERVER_URL}/${imageUrl}`;
};

/**
 * Get the best available URL for an image with hybrid storage support
 * @param {Object|String} imageData - Image data or URL
 * @returns {String} - Best available URL
 */
export const getBestImageUrl = (imageData) => {
  // Handle null/undefined
  if (!imageData) return null;
  
  // Handle string type (direct URL)
  if (typeof imageData === 'string') {
    return formatImageUrl(imageData);
  }
  
  // Handle object type - prefer Cloudinary URL
  if (imageData && typeof imageData === 'object') {
    // First try Cloudinary URL (preferred for performance and CDN)
    if (imageData.cloudinaryUrl || (imageData.url && imageData.url.includes('cloudinary.com'))) {
      return imageData.cloudinaryUrl || imageData.url;
    }
    
    // Then try general URL
    if (imageData.url) {
      return formatImageUrl(imageData.url);
    }
    
    // Finally try local path (fallback)
    if (imageData.localPath) {
      return formatImageUrl(imageData.localPath);
    }
    
    // Legacy support - check for public_id and construct URL
    if (imageData.public_id && !imageData.url) {
      return `${BASE_SERVER_URL}/uploads/profile/${imageData.public_id}`;
    }
  }
  
  return null;
};

/**
 * Gets the first available image URL from a product's images array
 * @param {Array} images - Array of image objects
 * @returns {string|null} - Formatted image URL or null if no images
 */
export const getProductImageUrl = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }

  const firstImage = images[0];
  if (!firstImage || !firstImage.url) {
    return null;
  }

  return formatImageUrl(firstImage.url);
};

/**
 * Creates a fallback image source object for React Native Image component
 * @param {string} imageUrl - The primary image URL
 * @param {string} fallbackUrl - Optional fallback URL
 * @returns {Object} - Image source object with fallback
 */
export const createImageSource = (imageUrl, fallbackUrl = null) => {
  const primaryUrl = formatImageUrl(imageUrl);
  
  if (!primaryUrl) {
    return fallbackUrl ? { uri: formatImageUrl(fallbackUrl) } : null;
  }

  return { uri: primaryUrl };
};

/**
 * Creates an image source object for React Native Image component with hybrid support
 * @param {Object|String} imageData - Image data
 * @param {Object} defaultSource - Default source if image is not available
 * @returns {Object} - Image source object
 */
export const createHybridImageSource = (imageData, defaultSource = null) => {
  const url = getBestImageUrl(imageData);
  
  if (url && validateImageUrl(url)) {
    return { uri: url };
  }
  
  return defaultSource || null;
};

/**
 * Get the best available URLs for multiple images
 * @param {Array} imagesData - Array of image data
 * @returns {Array} - Array of best available URLs
 */
export const getBestImageUrls = (imagesData) => {
  if (!Array.isArray(imagesData)) return [];
  
  return imagesData
    .map(imageData => getBestImageUrl(imageData))
    .filter(url => url !== null);
};

/**
 * Check if an image is stored in Cloudinary
 * @param {Object|String} imageData - Image data
 * @returns {Boolean} - True if stored in Cloudinary
 */
export const isCloudinaryImage = (imageData) => {
  if (!imageData) return false;
  
  if (typeof imageData === 'string') {
    return imageData.includes('cloudinary.com');
  }
  
  if (typeof imageData === 'object') {
    return imageData.isCloudinaryUploaded === true || 
           imageData.storageType === 'cloudinary' ||
           imageData.storageType === 'hybrid' ||
           (imageData.url && imageData.url.includes('cloudinary.com')) ||
           (imageData.cloudinaryUrl && imageData.cloudinaryUrl.includes('cloudinary.com'));
  }
  
  return false;
};

/**
 * Validate image URL
 * @param {String} url - Image URL
 * @returns {Boolean} - True if URL appears valid
 */
export const validateImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Basic URL validation
  try {
    new URL(url);
    // Check for common image extensions or cloudinary patterns
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) || 
           url.includes('cloudinary.com') ||
           url.includes('/uploads/');
  } catch {
    return false;
  }
};

/**
 * Get image metadata if available
 * @param {Object} imageData - Image data
 * @returns {Object} - Image metadata
 */
export const getImageMetadata = (imageData) => {
  if (!imageData || typeof imageData !== 'object') {
    return {};
  }
  
  return {
    size: imageData.metadata?.size || imageData.size || null,
    mimetype: imageData.metadata?.mimetype || imageData.mimetype || null,
    width: imageData.metadata?.width || imageData.width || null,
    height: imageData.metadata?.height || imageData.height || null,
    format: imageData.metadata?.format || imageData.format || null,
    storageType: imageData.storageType || 'unknown',
    uploadedAt: imageData.uploadedAt || imageData.created_at || null,
    isCloudinary: isCloudinaryImage(imageData)
  };
};
