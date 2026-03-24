/**
 * Character Splitter
 * Splits text into fixed-size character chunks with overlap
 */

import { BaseSplitter } from './base/BaseSplitter.js';

export class CharacterSplitter extends BaseSplitter {
  constructor() {
    super(
      'character',
      'Fixed-size character chunks with configurable overlap'
    );
  }
  
  /**
   * Split text into character-based chunks
   * @param {string} text - Input text
   * @param {number} chunkSize - Target chunk size in characters
   * @param {number} overlap - Overlap between chunks
   * @returns {Array<Object>} - Array of chunks
   */
  split(text, chunkSize, overlap) {
    // Validate parameters
    this.validateParams(text, chunkSize, overlap);
    
    const chunks = [];
    let startIndex = 0;
    let chunkIndex = 0;
    
    // Handle edge case: overlap >= chunkSize
    const effectiveOverlap = Math.min(overlap, chunkSize - 1);
    
    while (startIndex < text.length) {
      // Calculate end index for this chunk
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      
      // Extract chunk text
      const chunkText = text.substring(startIndex, endIndex);
      
      // Create chunk object
      const chunk = this.createChunk(
        chunkText,
        startIndex,
        endIndex,
        chunkIndex,
        {
          size: chunkText.length,
          hasOverlap: chunkIndex > 0 && effectiveOverlap > 0
        }
      );
      
      chunks.push(chunk);
      
      // Move to next chunk position
      // Subtract overlap to create overlapping chunks
      startIndex += chunkSize - effectiveOverlap;
      chunkIndex++;
      
      // Prevent infinite loop
      if (effectiveOverlap >= chunkSize && startIndex <= endIndex) {
        startIndex = endIndex;
      }
    }
    
    return chunks;
  }
}

export default CharacterSplitter;