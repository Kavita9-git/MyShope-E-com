/**
 * Image utility functions for handling remote image URLs
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
