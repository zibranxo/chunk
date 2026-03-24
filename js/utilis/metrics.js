/**
 * Metrics Calculation Utility
 * Calculate various statistics about chunks
 */

/**
 * Calculate comprehensive metrics from text and chunks
 * @param {string} text - Original input text
 * @param {Array<Object>} chunks - Array of chunk objects
 * @returns {Object} - Metrics object
 */
export function calculateMetrics(text, chunks) {
  if (!text || !chunks || chunks.length === 0) {
    return {
      totalCharacters: text ? text.length : 0,
      numberOfChunks: 0,
      averageChunkSize: 0,
      minChunkSize: 0,
      maxChunkSize: 0,
      standardDeviation: 0,
      totalTokens: null
    };
  }
  
  const chunkSizes = chunks.map(chunk => chunk.text.length);
  const totalChars = text.length;
  const numChunks = chunks.length;
  const avgSize = chunkSizes.reduce((sum, size) => sum + size, 0) / numChunks;
  const minSize = Math.min(...chunkSizes);
  const maxSize = Math.max(...chunkSizes);
  
  // Calculate standard deviation
  const variance = chunkSizes.reduce((sum, size) => {
    return sum + Math.pow(size - avgSize, 2);
  }, 0) / numChunks;
  const stdDev = Math.sqrt(variance);
  
  // Word count
  const wordCount = (text.match(/\b\w+\b/g) || []).length;

  // Size distribution (5 buckets)
  const bucketCount = 5;
  const bucketSize = Math.max(1, Math.ceil((maxSize - minSize + 1) / bucketCount));
  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    label: `${minSize + i * bucketSize}–${minSize + (i + 1) * bucketSize - 1}`,
    count: 0
  }));
  chunkSizes.forEach(size => {
    const idx = Math.min(Math.floor((size - minSize) / bucketSize), bucketCount - 1);
    buckets[idx].count++;
  });

  return {
    totalCharacters: totalChars,
    numberOfChunks: numChunks,
    averageChunkSize: Math.round(avgSize),
    minChunkSize: minSize,
    maxChunkSize: maxSize,
    standardDeviation: Math.round(stdDev),
    wordCount: wordCount,
    distribution: buckets,
    totalTokens: null
  };
}

/**
 * Calculate overlap percentage
 * @param {number} chunkSize - Size of chunks
 * @param {number} overlap - Overlap amount
 * @returns {number} - Overlap percentage
 */
export function calculateOverlapPercentage(chunkSize, overlap) {
  if (chunkSize === 0) return 0;
  return Math.round((overlap / chunkSize) * 100);
}

/**
 * Estimate compression ratio
 * @param {string} text - Original text
 * @param {Array<Object>} chunks - Chunks array
 * @returns {number} - Compression ratio
 */
export function calculateCompressionRatio(text, chunks) {
  if (!text || !chunks || chunks.length === 0) return 1;
  
  const totalChunkChars = chunks.reduce((sum, chunk) => sum + chunk.text.length, 0);
  return totalChunkChars / text.length;
}

export default {
  calculateMetrics,
  calculateOverlapPercentage,
  calculateCompressionRatio
};