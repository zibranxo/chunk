/**
 * Recursive Character Splitter
 * Hierarchical splitting: paragraphs → sentences → words → characters
 */

import { BaseSplitter } from './base/BaseSplitter.js';

export class RecursiveSplitter extends BaseSplitter {
  constructor() {
    super(
      'recursive',
      'Hierarchical splitting: paragraphs → sentences → words → characters'
    );
    
    // Separators in order of preference
    this.separators = [
      '\n\n',  // Paragraph breaks
      '\n',    // Line breaks
      '. ',    // Sentence endings
      '! ',    // Exclamation sentences
      '? ',    // Question sentences
      '; ',    // Semicolons
      ', ',    // Commas
      ' ',     // Words
      ''       // Characters (fallback)
    ];
  }
  
  /**
   * Split text recursively
   * @param {string} text - Input text
   * @param {number} chunkSize - Target chunk size
   * @param {number} overlap - Overlap amount
   * @returns {Array<Object>} - Array of chunks
   */
  split(text, chunkSize, overlap) {
    this.validateParams(text, chunkSize, overlap);
    
    const chunks = [];
    const splits = this._recursiveSplit(text, chunkSize, 0);
    
    // Convert splits to chunk objects with overlap
    const effectiveOverlap = Math.min(overlap, chunkSize - 1);
    
    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];
      
      // Calculate start index by summing previous splits
      let startIndex = 0;
      for (let j = 0; j < i; j++) {
        startIndex += splits[j].length;
      }
      
      // Adjust for overlap
      if (i > 0 && effectiveOverlap > 0) {
        startIndex -= effectiveOverlap;
      }
      
      const endIndex = startIndex + split.length;
      
      const chunk = this.createChunk(
        split,
        Math.max(0, startIndex),
        endIndex,
        i,
        {
          size: split.length,
          hasOverlap: i > 0 && effectiveOverlap > 0
        }
      );
      
      chunks.push(chunk);
    }
    
    return chunks;
  }
  
  /**
   * Recursive splitting helper
   * @param {string} text - Text to split
   * @param {number} chunkSize - Target size
   * @param {number} separatorIndex - Current separator index
   * @returns {Array<string>} - Array of text splits
   */
  _recursiveSplit(text, chunkSize, separatorIndex) {
    // Base case: text is small enough
    if (text.length <= chunkSize) {
      return [text];
    }
    
    // Base case: no more separators, split by character
    if (separatorIndex >= this.separators.length) {
      return this._splitByCharacter(text, chunkSize);
    }
    
    const separator = this.separators[separatorIndex];
    const splits = [];
    
    // Split by current separator
    let parts;
    if (separator === '') {
      // Character-level split (last resort)
      return this._splitByCharacter(text, chunkSize);
    } else {
      parts = text.split(separator);
    }
    
    // Merge parts into chunks
    let currentChunk = '';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const partWithSep = i < parts.length - 1 ? part + separator : part;
      
      if (currentChunk.length === 0) {
        currentChunk = partWithSep;
      } else if (currentChunk.length + partWithSep.length <= chunkSize) {
        currentChunk += partWithSep;
      } else {
        // Current chunk is ready
        if (currentChunk.length > chunkSize) {
          // Still too large, recurse with next separator
          const recursiveSplits = this._recursiveSplit(
            currentChunk,
            chunkSize,
            separatorIndex + 1
          );
          splits.push(...recursiveSplits);
        } else {
          splits.push(currentChunk);
        }
        
        currentChunk = partWithSep;
      }
    }
    
    // Add remaining chunk
    if (currentChunk) {
      if (currentChunk.length > chunkSize) {
        const recursiveSplits = this._recursiveSplit(
          currentChunk,
          chunkSize,
          separatorIndex + 1
        );
        splits.push(...recursiveSplits);
      } else {
        splits.push(currentChunk);
      }
    }
    
    return splits;
  }
  
  /**
   * Split text by character (last resort)
   * @param {string} text - Text to split
   * @param {number} chunkSize - Chunk size
   * @returns {Array<string>} - Character-based splits
   */
  _splitByCharacter(text, chunkSize) {
    const splits = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      splits.push(text.substring(i, i + chunkSize));
    }
    return splits;
  }
}

export default RecursiveSplitter;