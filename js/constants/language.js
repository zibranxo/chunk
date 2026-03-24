/**
 * Language Configurations
 * Metadata for each supported language type
 */

export const LANGUAGES = {
  plaintext: {
    name: 'Plain Text',
    extensions: ['.txt'],
    description: 'Plain text without syntax',
    useLanguageAwareSplitter: false
  },
  python: {
    name: 'Python',
    extensions: ['.py'],
    description: 'Python source code',
    useLanguageAwareSplitter: true,
    keywords: ['def ', 'class ', 'if ', 'for ', 'while ', 'import ', 'from ']
  },
  javascript: {
    name: 'JavaScript',
    extensions: ['.js'],
    description: 'JavaScript source code',
    useLanguageAwareSplitter: true,
    keywords: ['function ', 'class ', 'const ', 'let ', 'var ', 'if ', 'for ', 'while ']
  },
  cpp: {
    name: 'C++',
    extensions: ['.cpp', '.c', '.h'],
    description: 'C/C++ source code',
    useLanguageAwareSplitter: true,
    keywords: ['class ', 'struct ', 'void ', 'int ', 'float ', 'double ', 'if ', 'for ', 'while ']
  },
  markdown: {
    name: 'Markdown',
    extensions: ['.md'],
    description: 'Markdown formatted text',
    useLanguageAwareSplitter: true,
    keywords: ['# ', '## ', '### ', '```', '---']
  },
  html: {
    name: 'HTML',
    extensions: ['.html', '.htm'],
    description: 'HTML markup',
    useLanguageAwareSplitter: true,
    keywords: ['<html', '<head', '<body', '<div', '<section', '<article']
  },
  latex: {
    name: 'LaTeX',
    extensions: ['.tex'],
    description: 'LaTeX document',
    useLanguageAwareSplitter: true,
    keywords: ['\\documentclass', '\\begin', '\\end', '\\section', '\\subsection']
  }
};

/**
 * Detect language from file extension
 * @param {string} filename - The file name
 * @returns {string} - Language key
 */
export function detectLanguageFromFilename(filename) {
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  
  for (const [key, config] of Object.entries(LANGUAGES)) {
    if (config.extensions.includes(extension)) {
      return key;
    }
  }
  
  return 'plaintext';
}

/**
 * Get language configuration
 * @param {string} languageKey - Language identifier
 * @returns {Object} - Language configuration
 */
export function getLanguageConfig(languageKey) {
  return LANGUAGES[languageKey] || LANGUAGES.plaintext;
}

export default LANGUAGES;