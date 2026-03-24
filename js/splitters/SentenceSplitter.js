/**
 * Sentence Splitter
 * Splits text at sentence boundaries while respecting chunk size limits
 */

import { BaseSplitter } from './base/BaseSplitter.js';
import { detectSentences } from '../utilis/sentenceDetector.js';

export class SentenceSplitter extends BaseSplitter {
  constructor() {
    super(
      'sentence',
      'Split at sentence boundaries while respecting chunk size limits'
    );
  }
  
  /**
   * Split text into sentence-based chunks
   * @param {string} text - Input text
   * @param {number} chunkSize - Target chunk size in characters
   * @param {number} overlap - Overlap in characters
   * @returns {Array<Object>} - Array of chunks
   */
  split(text, chunkSize, overlap) {
    this.validateParams(text, chunkSize, overlap);
    
    // Detect all sentences
    const sentences = detectSentences(text);
    
    if (sentences.length === 0) {
      return [];
    }
    
    const chunks = [];
    let currentChunk = {
      sentences: [],
      text: '',
      startIndex: 0,
      endIndex: 0
    };
    
    let chunkIndex = 0;
    const effectiveOverlap = Math.min(overlap, chunkSize - 1);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const potentialText = currentChunk.text + 
        (currentChunk.text ? ' ' : '') + sentence.text;
      
      // Check if adding this sentence would exceed chunk size
      if (potentialText.length > chunkSize && currentChunk.sentences.length > 0) {
        // Finalize current chunk
        this._finalizeChunk(currentChunk, chunks, chunkIndex);
        chunkIndex++;
        
        // Handle overlap: include last few sentences from previous chunk
        if (effectiveOverlap > 0) {
          currentChunk = this._createOverlapChunk(
            currentChunk.sentences,
            effectiveOverlap
          );
        } else {
          currentChunk = {
            sentences: [],
            text: '',
            startIndex: sentence.startIndex,
            endIndex: sentence.startIndex
          };
        }
      }
      
      // Add sentence to current chunk
      currentChunk.sentences.push(sentence);
      currentChunk.text = currentChunk.sentences.map(s => s.text).join(' ');
      
      if (currentChunk.sentences.length === 1) {
        currentChunk.startIndex = sentence.startIndex;
      }
      currentChunk.endIndex = sentence.endIndex;
    }
    
    // Add final chunk if it has content
    if (currentChunk.sentences.length > 0) {
      this._finalizeChunk(currentChunk, chunks, chunkIndex);
    }
    
    return chunks;
  }
  
  /**
   * Finalize and add chunk to chunks array
   * @param {Object} currentChunk - Current chunk being built
   * @param {Array} chunks - Chunks array
   * @param {number} chunkIndex - Current chunk index
   */
  _finalizeChunk(currentChunk, chunks, chunkIndex) {
    const chunk = this.createChunk(
      currentChunk.text,
      currentChunk.startIndex,
      currentChunk.endIndex,
      chunkIndex,
      {
        sentenceCount: currentChunk.sentences.length,
        size: currentChunk.text.length,
        hasOverlap: chunkIndex > 0
      }
    );
    chunks.push(chunk);
  }
  
  /**
   * Create overlap chunk from previous sentences
   * @param {Array} previousSentences - Sentences from previous chunk
   * @param {number} overlapSize - Target overlap size
   * @returns {Object} - New chunk object with overlap
   */
  _createOverlapChunk(previousSentences, overlapSize) {
    const overlapSentences = [];
    let overlapText = '';
    
    // Take sentences from the end until we reach overlap size
    for (let i = previousSentences.length - 1; i >= 0; i--) {
      const sentence = previousSentences[i];
      const potentialText = sentence.text + (overlapText ? ' ' : '') + overlapText;
      
      if (potentialText.length > overlapSize && overlapSentences.length > 0) {
        break;
      }
      
      overlapSentences.unshift(sentence);
      overlapText = potentialText;
    }
    
    return {
      sentences: overlapSentences,
      text: overlapText,
      startIndex: overlapSentences[0]?.startIndex || 0,
      endIndex: overlapSentences[overlapSentences.length - 1]?.endIndex || 0
    };
  }
}

export default SentenceSplitter;