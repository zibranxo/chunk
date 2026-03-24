/**
 * Sentence Detector Utility
 * Detects sentence boundaries using regex patterns
 */

/**
 * Detect sentences in text
 * @param {string} text - Input text
 * @returns {Array<Object>} - Array of sentence objects with text and positions
 */
export function detectSentences(text) {
  if (!text || text.trim().length === 0) {
    return [];
  }
  
  const sentences = [];
  
  // Regex pattern for sentence boundaries
  // Matches: . ! ? followed by space/newline or end of string
  // Handles common abbreviations
  const sentencePattern = /([^.!?]+[.!?]+)/g;
  
  // Special handling for common abbreviations to avoid false splits
  const abbreviations = ['Mr.', 'Mrs.', 'Dr.', 'Ms.', 'Prof.', 'Sr.', 'Jr.', 
                         'vs.', 'etc.', 'e.g.', 'i.e.', 'Ph.D.', 'M.D.'];
  
  // Replace abbreviations temporarily
  let processedText = text;
  const abbreviationPlaceholders = [];
  
  abbreviations.forEach((abbr, index) => {
    const placeholder = `__ABBR${index}__`;
    const regex = new RegExp(abbr.replace('.', '\\.'), 'g');
    processedText = processedText.replace(regex, placeholder);
    abbreviationPlaceholders.push({ placeholder, abbr });
  });
  
  // Find sentences
  let match;
  let lastIndex = 0;
  
  while ((match = sentencePattern.exec(processedText)) !== null) {
    let sentenceText = match[1].trim();
    
    // Restore abbreviations
    abbreviationPlaceholders.forEach(({ placeholder, abbr }) => {
      sentenceText = sentenceText.replace(new RegExp(placeholder, 'g'), abbr);
    });
    
    if (sentenceText.length > 0) {
      // Find the position in original text
      const startIndex = text.indexOf(sentenceText, lastIndex);
      const endIndex = startIndex + sentenceText.length;
      
      sentences.push({
        text: sentenceText,
        startIndex: startIndex,
        endIndex: endIndex
      });
      
      lastIndex = endIndex;
    }
  }
  
  // Handle any remaining text (might not end with punctuation)
  const remainingText = text.substring(lastIndex).trim();
  if (remainingText.length > 0) {
    // Restore abbreviations in remaining text
    let restoredText = remainingText;
    abbreviationPlaceholders.forEach(({ placeholder, abbr }) => {
      restoredText = restoredText.replace(new RegExp(placeholder, 'g'), abbr);
    });
    
    sentences.push({
      text: restoredText,
      startIndex: lastIndex,
      endIndex: text.length
    });
  }
  
  return sentences;
}

/**
 * Split text into sentences (simple string array)
 * @param {string} text - Input text
 * @returns {Array<string>} - Array of sentence strings
 */
export function splitIntoSentences(text) {
  const sentenceObjects = detectSentences(text);
  return sentenceObjects.map(s => s.text);
}

/**
 * Count sentences in text
 * @param {string} text - Input text
 * @returns {number} - Number of sentences
 */
export function countSentences(text) {
  return detectSentences(text).length;
}

export default {
  detectSentences,
  splitIntoSentences,
  countSentences
};