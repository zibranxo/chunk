/**
 * Markdown Splitter
 * Language-aware splitting for Markdown documents
 */

import { BaseSplitter } from '../base/BaseSplitter.js';
import { CodeParser } from '../../utilis/codeParser.js';

export class MarkdownSplitter extends BaseSplitter {
  constructor() {
    super(
      'markdown',
      'Markdown-aware splitting that respects heading boundaries'
    );
  }
  
  /**
   * Split Markdown text
   * @param {string} text - Markdown text
   * @param {number} chunkSize - Target chunk size
   * @param {number} overlap - Overlap amount
   * @returns {Array<Object>} - Array of chunks
   */
  split(text, chunkSize, overlap) {
    this.validateParams(text, chunkSize, overlap);
    
    // Find Markdown sections
    const sections = CodeParser.findMarkdownSections(text);
    
    if (sections.length === 0) {
      return this._fallbackSplit(text, chunkSize, overlap);
    }
    
    const chunks = [];
    let chunkIndex = 0;
    let currentText = '';
    let currentStart = 0;
    
    for (const section of sections) {
      const sectionText = section.text;
      const potentialText = currentText + (currentText ? '\n\n' : '') + sectionText;
      
      if (potentialText.length > chunkSize && currentText.length > 0) {
        chunks.push(this.createChunk(
          currentText,
          currentStart,
          currentStart + currentText.length,
          chunkIndex,
          { language: 'markdown' }
        ));
        chunkIndex++;
        currentText = sectionText;
        currentStart = section.start;
      } else {
        if (currentText.length === 0) {
          currentStart = section.start;
        }
        currentText = potentialText;
      }
    }
    
    if (currentText) {
      chunks.push(this.createChunk(
        currentText,
        currentStart,
        currentStart + currentText.length,
        chunkIndex,
        { language: 'markdown' }
      ));
    }
    
    return chunks;
  }
  
  _fallbackSplit(text, chunkSize, overlap) {
    const chunks = [];
    let startIndex = 0;
    let chunkIndex = 0;
    
    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      chunks.push(this.createChunk(
        text.substring(startIndex, endIndex),
        startIndex,
        endIndex,
        chunkIndex,
        { language: 'markdown' }
      ));
      startIndex += chunkSize - overlap;
      chunkIndex++;
    }
    
    return chunks;
  }
}

export default MarkdownSplitter;