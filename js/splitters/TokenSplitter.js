/**
 * Token Splitter
 * Splits text based on token count using simple word-based tokenization
 */

import { BaseSplitter } from './base/BaseSplitter.js';
import SimpleTokenizer from '../utilis/tokenizer.js';

export class TokenSplitter extends BaseSplitter {
  constructor() {
    super(
      'token',
      'Split by token count (word-based) for better semantic boundaries'
    );
    this.tokenizer = new SimpleTokenizer();
  }
  
  /**
   * Split text into token-based chunks
   * @param {string} text - Input text
   * @param {number} chunkSize - Target chunk size in tokens
   * @param {number} overlap - Overlap in tokens
   * @returns {Array<Object>} - Array of chunks
   */
  split(text, chunkSize, overlap) {
    this.validateParams(text, chunkSize, overlap);
    
    // Get token positions
    const tokenPositions = this.tokenizer.getTokenPositions(text);
    
    if (tokenPositions.length === 0) {
      return [];
    }
    
    const chunks = [];
    let tokenIndex = 0;
    let chunkIndex = 0;
    
    const effectiveOverlap = Math.min(overlap, chunkSize - 1);
    
    while (tokenIndex < tokenPositions.length) {
      // Get tokens for this chunk
      const endTokenIndex = Math.min(tokenIndex + chunkSize, tokenPositions.length);
      const chunkTokens = tokenPositions.slice(tokenIndex, endTokenIndex);
      
      if (chunkTokens.length === 0) break;
      
      // Get character positions from first and last token
      const startPos = chunkTokens[0].start;
      const endPos = chunkTokens[chunkTokens.length - 1].end;
      
      // Extract chunk text
      const chunkText = text.substring(startPos, endPos);
      
      // Create chunk
      const chunk = this.createChunk(
        chunkText,
        startPos,
        endPos,
        chunkIndex,
        {
          tokenCount: chunkTokens.length,
          size: chunkText.length,
          hasOverlap: chunkIndex > 0 && effectiveOverlap > 0
        }
      );
      
      chunks.push(chunk);
      
      // Move to next chunk
      tokenIndex += chunkSize - effectiveOverlap;
      chunkIndex++;
      
      // Prevent infinite loop
      if (tokenIndex <= 0 || effectiveOverlap >= chunkSize) {
        tokenIndex = endTokenIndex;
      }
    }
    
    return chunks;
  }
}

export default TokenSplitter;