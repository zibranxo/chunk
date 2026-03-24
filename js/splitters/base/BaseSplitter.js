/**
 * Base Splitter Class
 * Abstract base class that all splitters must extend
 */

/**
 * Chunk Object Structure:
 * {
 *   text: string,        // The chunk text content
 *   startIndex: number,  // Start position in original text
 *   endIndex: number,    // End position in original text
 *   index: number,       // Chunk number (0-based)
 *   metadata: Object     // Optional metadata (tokens, overlap info, etc.)
 * }
 */

export class BaseSplitter {
  /**
   * Constructor
   * @param {string} name - Splitter name
   * @param {string} description - Splitter description
   */
  constructor(name, description) {
    // Prevent direct instantiation of abstract class
    if (new.target === BaseSplitter) {
      throw new Error('Cannot instantiate abstract class BaseSplitter directly');
    }
    
    this.name = name;
    this.description = description;
  }
  
  /**
   * Split text into chunks (MUST be implemented by subclasses)
   * @param {string} text - Input text to split
   * @param {number} chunkSize - Target chunk size
   * @param {number} overlap - Overlap between chunks
   * @param {string} language - Language type (optional)
   * @returns {Array<Object>} - Array of chunk objects
   */
  split(text, chunkSize, overlap, language = 'plaintext') {
    throw new Error('Method split() must be implemented by subclass');
  }
  
  /**
   * Validate split parameters
   * @param {string} text - Input text
   * @param {number} chunkSize - Chunk size
   * @param {number} overlap - Overlap amount
   * @throws {Error} - If parameters are invalid
   */
  validateParams(text, chunkSize, overlap) {
    if (!text || typeof text !== 'string') {
      throw new Error('Text must be a non-empty string');
    }
    
    if (typeof chunkSize !== 'number' || chunkSize <= 0) {
      throw new Error('Chunk size must be a positive number');
    }
    
    if (typeof overlap !== 'number' || overlap < 0) {
      throw new Error('Overlap must be a non-negative number');
    }
    
    if (overlap >= chunkSize) {
      console.warn('Overlap is greater than or equal to chunk size. This may cause issues.');
    }
  }
  
  /**
   * Create a chunk object
   * @param {string} text - Chunk text
   * @param {number} startIndex - Start position
   * @param {number} endIndex - End position
   * @param {number} index - Chunk index
   * @param {Object} metadata - Optional metadata
   * @returns {Object} - Chunk object
   */
  createChunk(text, startIndex, endIndex, index, metadata = {}) {
    return {
      text: text,
      startIndex: startIndex,
      endIndex: endIndex,
      index: index,
      metadata: metadata
    };
  }
  
  /**
   * Get splitter information
   * @returns {Object} - Splitter info
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description
    };
  }
}

export default BaseSplitter;