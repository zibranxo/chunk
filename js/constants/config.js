/**
 * Application Configuration Constants
 */

export const CONFIG = {
  // Chunk Size Settings
  DEFAULT_CHUNK_SIZE: 500,
  MIN_CHUNK_SIZE: 50,
  MAX_CHUNK_SIZE: 5000,
  CHUNK_SIZE_STEP: 50,
  
  // Overlap Settings
  DEFAULT_OVERLAP: 50,
  MIN_OVERLAP: 0,
  OVERLAP_STEP: 10,
  
  // Default Splitter
  DEFAULT_SPLITTER: 'character',
  
  // Default Language
  DEFAULT_LANGUAGE: 'plaintext',
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_EXTENSIONS: ['.txt', '.md', '.py', '.js', '.cpp', '.c', '.h', '.html', '.tex', '.css', '.json'],
  
  // UI Settings
  DEBOUNCE_DELAY: 300, // milliseconds
  MAX_CHUNKS_BEFORE_WARNING: 1000,
  
  // Chunk Colors (indices correspond to color rotation)
  CHUNK_COLORS: 5, // Total number of color variants
  
  // Feature Flags
  FEATURES: {
    SHOW_OVERLAP: true,
    COMPACT_VIEW: true,
    TOKEN_COUNTING: true
  }
};

export default CONFIG;