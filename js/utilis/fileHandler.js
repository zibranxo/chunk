/**
 * File Handler Utility
 * Handles file upload, validation, and reading
 */

import CONFIG from '../constants/config.js';

/**
 * File Handler Class
 */
export class FileHandler {
  /**
   * Read text from a file
   * @param {File} file - File object from input
   * @returns {Promise<string>} - File contents as text
   */
  static async readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Validate file before reading
   * @param {File} file - File object to validate
   * @throws {Error} - If file is invalid
   * @returns {boolean} - True if valid
   */
  static validateFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Check file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = CONFIG.ALLOWED_EXTENSIONS.some(ext => 
      fileName.endsWith(ext)
    );
    
    if (!hasValidExtension) {
      throw new Error(
        `Invalid file type. Allowed extensions: ${CONFIG.ALLOWED_EXTENSIONS.join(', ')}`
      );
    }
    
    return true;
  }
  
  /**
   * Get file extension
   * @param {File} file - File object
   * @returns {string} - File extension (with dot)
   */
  static getFileExtension(file) {
    const fileName = file.name;
    return fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  }
  
  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted size string
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export default FileHandler;