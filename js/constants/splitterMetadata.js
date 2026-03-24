/**
 * Splitter Metadata
 * Descriptions and configurations for each splitter type
 */

export const SPLITTER_METADATA = {
  character: {
    name: 'Character Splitter',
    description: 'Fixed-size character chunks with configurable overlap',
    supportsAllLanguages: true,
    icon: '📝'
  },
  token: {
    name: 'Token Splitter',
    description: 'Split by token count (word-based) for better semantic boundaries',
    supportsAllLanguages: true,
    icon: '🔤'
  },
  sentence: {
    name: 'Sentence Splitter',
    description: 'Split at sentence boundaries while respecting chunk size limits',
    supportsAllLanguages: true,
    icon: '📄'
  },
  recursive: {
    name: 'Recursive Character Splitter',
    description: 'Hierarchical splitting: paragraphs → sentences → words → characters',
    supportsAllLanguages: true,
    icon: '🔄'
  }
};

/**
 * Get splitter metadata
 * @param {string} splitterKey - Splitter identifier
 * @returns {Object} - Splitter metadata
 */
export function getSplitterMetadata(splitterKey) {
  return SPLITTER_METADATA[splitterKey] || SPLITTER_METADATA.character;
}

export default SPLITTER_METADATA;