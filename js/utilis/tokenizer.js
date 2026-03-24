/**
 * Simple Tokenizer
 * Word-based tokenization (simpler alternative to tiktoken for browser)
 */

/**
 * Simple Tokenizer Class
 * Uses word-based tokenization with punctuation handling
 */
export class SimpleTokenizer {
  constructor() {
    // Pattern to split on whitespace and capture punctuation as separate tokens
    this.tokenPattern = /\w+|[^\w\s]/g;
  }
  
  /**
   * Tokenize text into array of tokens
   * @param {string} text - Text to tokenize
   * @returns {Array<string>} - Array of tokens
   */
  tokenize(text) {
    if (!text) return [];
    
    const tokens = text.match(this.tokenPattern) || [];
    return tokens;
  }
  
  /**
   * Count tokens in text
   * @param {string} text - Text to count tokens in
   * @returns {number} - Token count
   */
  countTokens(text) {
    return this.tokenize(text).length;
  }
  
  /**
   * Get character positions for each token
   * @param {string} text - Original text
   * @returns {Array<Object>} - Array of {token, start, end}
   */
  getTokenPositions(text) {
    if (!text) return [];
    
    const positions = [];
    let match;
    const regex = new RegExp(this.tokenPattern);
    
    // Reset regex lastIndex
    regex.lastIndex = 0;
    
    // Use exec in a loop to get positions
    let lastIndex = 0;
    const tokens = text.match(this.tokenPattern) || [];
    
    for (const token of tokens) {
      const start = text.indexOf(token, lastIndex);
      const end = start + token.length;
      
      positions.push({
        token,
        start,
        end
      });
      
      lastIndex = end;
    }
    
    return positions;
  }
  
  /**
   * Reconstruct text from tokens
   * @param {Array<string>} tokens - Array of tokens
   * @returns {string} - Reconstructed text (note: whitespace may differ)
   */
  detokenize(tokens) {
    if (!tokens || tokens.length === 0) return '';
    
    // Simple join with space
    // This is a simplified approach and may not preserve original spacing
    return tokens.join(' ');
  }
  
  /**
   * Estimate tokens from character count (rough approximation)
   * Useful for quick estimates without full tokenization
   * @param {number} charCount - Character count
   * @returns {number} - Estimated token count
   */
  static estimateTokensFromChars(charCount) {
    // Rough estimate: ~4 characters per token on average
    return Math.ceil(charCount / 4);
  }
  
  /**
   * Estimate characters from token count
   * @param {number} tokenCount - Token count
   * @returns {number} - Estimated character count
   */
  static estimateCharsFromTokens(tokenCount) {
    // Rough estimate: ~4 characters per token on average
    return tokenCount * 4;
  }
}

export default SimpleTokenizer;