/**
 * Code Parser Utility
 * Detects code structures (functions, classes, blocks) for language-aware splitting
 */

/**
 * Code Parser Class
 */
export class CodeParser {
  /**
   * Find Python function and class definitions
   * @param {string} text - Python code
   * @returns {Array<Object>} - Array of code blocks
   */
  static findPythonBlocks(text) {
    const blocks = [];
    const lines = text.split('\n');
    
    // Pattern for def and class
    const defPattern = /^(\s*)(def|class)\s+(\w+)/;
    
    let currentBlock = null;
    let currentIndent = 0;
    
    lines.forEach((line, lineIndex) => {
      const match = line.match(defPattern);
      
      if (match) {
        // Save previous block if exists
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        
        // Start new block
        currentIndent = match[1].length;
        currentBlock = {
          type: match[2], // 'def' or 'class'
          name: match[3],
          startLine: lineIndex,
          startIndent: currentIndent,
          lines: [line]
        };
      } else if (currentBlock) {
        // Check if line belongs to current block (indentation-based)
        const lineIndent = line.search(/\S/);
        
        if (lineIndent === -1) {
          // Empty line, add to current block
          currentBlock.lines.push(line);
        } else if (lineIndent > currentIndent) {
          // Indented, part of block
          currentBlock.lines.push(line);
        } else {
          // De-indented, block ended
          blocks.push(currentBlock);
          currentBlock = null;
        }
      }
    });
    
    // Add last block
    if (currentBlock) {
      blocks.push(currentBlock);
    }
    
    // Convert to position-based blocks
    return this._convertLinesToPositions(blocks, text);
  }
  
  /**
   * Find JavaScript/C++ function and class definitions
   * @param {string} text - JS/C++ code
   * @returns {Array<Object>} - Array of code blocks
   */
  static findJavaScriptBlocks(text) {
    const blocks = [];
    
    // Patterns for functions and classes
    const patterns = [
      /function\s+(\w+)\s*\([^)]*\)\s*\{/g,  // function name() {}
      /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g,  // const name = () =>
      /class\s+(\w+)\s*\{/g,                   // class Name {
      /(\w+)\s*:\s*function\s*\([^)]*\)\s*\{/g // object methods
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const startPos = match.index;
        const name = match[1];
        
        // Find matching closing brace
        const endPos = this._findClosingBrace(text, startPos);
        
        if (endPos !== -1) {
          blocks.push({
            type: 'function',
            name: name,
            start: startPos,
            end: endPos,
            text: text.substring(startPos, endPos)
          });
        }
      }
    });
    
    // Sort by start position
    blocks.sort((a, b) => a.start - b.start);
    
    return blocks;
  }
  
  /**
   * Find C++ function and class definitions
   * @param {string} text - C++ code
   * @returns {Array<Object>} - Array of code blocks
   */
  static findCppBlocks(text) {
    // Similar to JavaScript but with C++ syntax
    const blocks = [];
    
    // Patterns for C++ structures
    const patterns = [
      /class\s+(\w+)\s*[:{]/g,              // class Name {
      /struct\s+(\w+)\s*\{/g,               // struct Name {
      /(void|int|float|double|bool|char)\s+(\w+)\s*\([^)]*\)\s*\{/g  // return_type name() {
    ];
    
    patterns.forEach((pattern, patternIndex) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const startPos = match.index;
        const name = match[patternIndex === 2 ? 2 : 1];
        
        // Find matching closing brace
        const endPos = this._findClosingBrace(text, startPos);
        
        if (endPos !== -1) {
          blocks.push({
            type: patternIndex < 2 ? 'class' : 'function',
            name: name,
            start: startPos,
            end: endPos,
            text: text.substring(startPos, endPos)
          });
        }
      }
    });
    
    blocks.sort((a, b) => a.start - b.start);
    return blocks;
  }
  
  /**
   * Find Markdown sections (headers)
   * @param {string} text - Markdown text
   * @returns {Array<Object>} - Array of sections
   */
  static findMarkdownSections(text) {
    const sections = [];
    const lines = text.split('\n');
    
    let currentSection = null;
    let currentLevel = 0;
    
    lines.forEach((line, index) => {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        const level = headerMatch[1].length;
        const title = headerMatch[2];
        
        currentSection = {
          type: 'section',
          level: level,
          title: title,
          startLine: index,
          lines: [line]
        };
        currentLevel = level;
      } else if (currentSection) {
        // Add line to current section
        currentSection.lines.push(line);
      }
    });
    
    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return this._convertLinesToPositions(sections, text);
  }
  
  /**
   * Find HTML tags and sections
   * @param {string} text - HTML text
   * @returns {Array<Object>} - Array of HTML elements
   */
  static findHtmlBlocks(text) {
    const blocks = [];
    
    // Major HTML tags that define sections
    const tags = ['html', 'head', 'body', 'header', 'main', 'footer', 
                  'section', 'article', 'div', 'nav'];
    
    tags.forEach(tag => {
      const openPattern = new RegExp(`<${tag}[^>]*>`, 'gi');
      let match;
      
      while ((match = openPattern.exec(text)) !== null) {
        const startPos = match.index;
        const closePattern = new RegExp(`</${tag}>`, 'i');
        const closeMatch = closePattern.exec(text.substring(startPos));
        
        if (closeMatch) {
          const endPos = startPos + closeMatch.index + closeMatch[0].length;
          blocks.push({
            type: 'element',
            name: tag,
            start: startPos,
            end: endPos,
            text: text.substring(startPos, endPos)
          });
        }
      }
    });
    
    blocks.sort((a, b) => a.start - b.start);
    return blocks;
  }
  
  /**
   * Find LaTeX sections
   * @param {string} text - LaTeX text
   * @returns {Array<Object>} - Array of LaTeX sections
   */
  static findLatexSections(text) {
    const sections = [];
    
    // LaTeX section commands
    const sectionCommands = [
      '\\chapter',
      '\\section',
      '\\subsection',
      '\\subsubsection',
      '\\paragraph'
    ];
    
    const lines = text.split('\n');
    let currentSection = null;
    
    lines.forEach((line, index) => {
      const sectionMatch = sectionCommands.some(cmd => line.trim().startsWith(cmd));
      
      if (sectionMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          type: 'section',
          startLine: index,
          lines: [line]
        };
      } else if (currentSection) {
        currentSection.lines.push(line);
      }
    });
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return this._convertLinesToPositions(sections, text);
  }
  
  /**
   * Helper: Find matching closing brace
   * @param {string} text - Text to search in
   * @param {number} startPos - Position of opening brace
   * @returns {number} - Position of closing brace or -1
   */
  static _findClosingBrace(text, startPos) {
    // Find opening brace first
    let openPos = text.indexOf('{', startPos);
    if (openPos === -1) return -1;
    
    let depth = 1;
    let pos = openPos + 1;
    
    while (pos < text.length && depth > 0) {
      if (text[pos] === '{') {
        depth++;
      } else if (text[pos] === '}') {
        depth--;
      }
      pos++;
    }
    
    return depth === 0 ? pos : -1;
  }
  
  /**
   * Helper: Convert line-based blocks to position-based
   * @param {Array<Object>} blocks - Line-based blocks
   * @param {string} text - Original text
   * @returns {Array<Object>} - Position-based blocks
   */
  static _convertLinesToPositions(blocks, text) {
    const lines = text.split('\n');
    
    return blocks.map(block => {
      const startPos = lines.slice(0, block.startLine).join('\n').length + 
                      (block.startLine > 0 ? 1 : 0);
      const blockText = block.lines.join('\n');
      const endPos = startPos + blockText.length;
      
      return {
        ...block,
        start: startPos,
        end: endPos,
        text: blockText
      };
    });
  }
}

export default CodeParser;