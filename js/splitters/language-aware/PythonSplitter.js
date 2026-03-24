/**
 * Python Splitter
 * Language-aware splitting for Python code
 */

import { BaseSplitter } from '../base/BaseSplitter.js';
import { CodeParser } from '../../utilis/codeParser.js';

export class PythonSplitter extends BaseSplitter {
  constructor() {
    super(
      'python',
      'Python-aware splitting that respects function and class boundaries'
    );
  }
  
  /**
   * Split Python code
   * @param {string} text - Python code
   * @param {number} chunkSize - Target chunk size
   * @param {number} overlap - Overlap amount
   * @returns {Array<Object>} - Array of chunks
   */
  split(text, chunkSize, overlap) {
    this.validateParams(text, chunkSize, overlap);
    
    // Find Python blocks (functions and classes)
    const blocks = CodeParser.findPythonBlocks(text);
    
    if (blocks.length === 0) {
      // Fallback to character splitting
      return this._fallbackSplit(text, chunkSize, overlap);
    }
    
    const chunks = [];
    let currentChunk = {
      blocks: [],
      text: '',
      startPos: 0,
      endPos: 0
    };
    
    let chunkIndex = 0;
    
    for (const block of blocks) {
      const blockText = block.text || block.lines.join('\n');
      const potentialText = currentChunk.text + 
        (currentChunk.text ? '\n\n' : '') + blockText;
      
      // Check if adding this block exceeds chunk size
      if (potentialText.length > chunkSize && currentChunk.blocks.length > 0) {
        // Finalize current chunk
        const chunk = this.createChunk(
          currentChunk.text,
          currentChunk.startPos,
          currentChunk.endPos,
          chunkIndex,
          {
            blockCount: currentChunk.blocks.length,
            language: 'python'
          }
        );
        chunks.push(chunk);
        chunkIndex++;
        
        // Start new chunk
        currentChunk = {
          blocks: [],
          text: '',
          startPos: block.start,
          endPos: block.start
        };
      }
      
      // Add block to current chunk
      currentChunk.blocks.push(block);
      currentChunk.text = currentChunk.blocks
        .map(b => b.text || b.lines.join('\n'))
        .join('\n\n');
      
      if (currentChunk.blocks.length === 1) {
        currentChunk.startPos = block.start;
      }
      currentChunk.endPos = block.end;
    }
    
    // Add final chunk
    if (currentChunk.blocks.length > 0) {
      const chunk = this.createChunk(
        currentChunk.text,
        currentChunk.startPos,
        currentChunk.endPos,
        chunkIndex,
        {
          blockCount: currentChunk.blocks.length,
          language: 'python'
        }
      );
      chunks.push(chunk);
    }
    
    return chunks;
  }
  
  /**
   * Fallback to simple character splitting
   * @param {string} text - Text to split
   * @param {number} chunkSize - Chunk size
   * @param {number} overlap - Overlap
   * @returns {Array<Object>} - Chunks
   */
  _fallbackSplit(text, chunkSize, overlap) {
    const chunks = [];
    let startIndex = 0;
    let chunkIndex = 0;
    
    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      const chunkText = text.substring(startIndex, endIndex);
      
      chunks.push(this.createChunk(
        chunkText,
        startIndex,
        endIndex,
        chunkIndex,
        { language: 'python', fallback: true }
      ));
      
      startIndex += chunkSize - overlap;
      chunkIndex++;
    }
    
    return chunks;
  }
}

export default PythonSplitter;