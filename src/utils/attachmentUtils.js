// Attachment utility functions

/**
 * Attachment size and type limits
 */
export const ATTACHMENT_LIMITS = {
  MAX_FILE_SIZE: 500 * 1024,           // 500 KB max per file for base64 storage
  MAX_IMAGE_SIZE: 200 * 1024,          // 200 KB max for images before warning
  MAX_TOTAL_SIZE: 5 * 1024 * 1024,     // 5 MB total per note
  THUMBNAIL_SIZE: { width: 200, height: 200 },
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/markdown',
  ],
};

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
};

/**
 * Check if file type is allowed
 * @param {string} mimeType - File MIME type
 * @returns {boolean} Whether the file type is allowed
 */
export const isAllowedType = (mimeType) => {
  return ATTACHMENT_LIMITS.ALLOWED_TYPES.includes(mimeType);
};

/**
 * Check if file is an image
 * @param {string} mimeType - File MIME type
 * @returns {boolean} Whether the file is an image
 */
export const isImage = (mimeType) => {
  return mimeType?.startsWith('image/');
};

/**
 * Validate a file for attachment
 * @param {File} file - File object
 * @returns {Object} { valid: boolean, error?: string, warning?: string }
 */
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!isAllowedType(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. Allowed: images, PDF, text files.`,
    };
  }

  if (file.size > ATTACHMENT_LIMITS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(ATTACHMENT_LIMITS.MAX_FILE_SIZE)}.`,
    };
  }

  let warning = null;
  if (isImage(file.type) && file.size > ATTACHMENT_LIMITS.MAX_IMAGE_SIZE) {
    warning = `Large image (${formatFileSize(file.size)}). Consider compressing for better sync performance.`;
  }

  return { valid: true, warning };
};

/**
 * Calculate total attachments size
 * @param {Array} attachments - Array of attachment objects
 * @returns {number} Total size in bytes
 */
export const getTotalAttachmentsSize = (attachments) => {
  if (!attachments || !Array.isArray(attachments)) return 0;
  return attachments.reduce((total, att) => total + (att.size || 0), 0);
};

/**
 * Check if adding a new attachment would exceed limits
 * @param {Array} existingAttachments - Current attachments
 * @param {number} newFileSize - Size of new file
 * @returns {Object} { allowed: boolean, error?: string }
 */
export const canAddAttachment = (existingAttachments, newFileSize) => {
  const currentTotal = getTotalAttachmentsSize(existingAttachments);
  const newTotal = currentTotal + newFileSize;

  if (newTotal > ATTACHMENT_LIMITS.MAX_TOTAL_SIZE) {
    return {
      allowed: false,
      error: `Adding this file would exceed the ${formatFileSize(ATTACHMENT_LIMITS.MAX_TOTAL_SIZE)} limit per note. Current: ${formatFileSize(currentTotal)}, New file: ${formatFileSize(newFileSize)}.`,
    };
  }

  return { allowed: true };
};

/**
 * Convert a File to base64 string
 * @param {File} file - File object
 * @returns {Promise<string>} Base64 encoded string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Compress an image file
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<string>} Compressed base64 image
 */
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Scale down if necessary
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG for better compression
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate a thumbnail for an image
 * @param {File} file - Image file
 * @returns {Promise<string>} Thumbnail base64 string
 */
export const generateThumbnail = (file) => {
  const { width, height } = ATTACHMENT_LIMITS.THUMBNAIL_SIZE;
  return compressImage(file, Math.max(width, height), 0.6);
};

/**
 * Create an attachment object from a file
 * @param {File} file - File object
 * @returns {Promise<Object>} Attachment object
 */
export const createAttachment = async (file) => {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const base64 = await fileToBase64(file);
  let thumbnailData = null;

  if (isImage(file.type)) {
    try {
      thumbnailData = await generateThumbnail(file);
    } catch (err) {
      console.warn('Failed to generate thumbnail:', err);
    }
  }

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: file.name,
    type: file.type,
    size: file.size,
    data: base64,
    url: null,
    thumbnailData,
    warning: validation.warning,
  };
};

/**
 * Get appropriate icon name for file type
 * @param {string} mimeType - File MIME type
 * @returns {string} Icon identifier
 */
export const getFileTypeIcon = (mimeType) => {
  if (isImage(mimeType)) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType?.startsWith('text/')) return 'text';
  return 'file';
};

/**
 * Extract file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension (lowercase)
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};
