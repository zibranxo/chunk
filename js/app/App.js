/**
 * Main Application Class
 * Orchestrates all components and manages application flow
 */

import StateManager from './StateManager.js';
import UIController from './UIController.js';
import SplitterRegistry from '../splitters/base/SplitterRegistry.js';
import CharacterSplitter from '../splitters/CharacterSplitter.js';
import TokenSplitter from '../splitters/TokenSplitter.js';
import SentenceSplitter from '../splitters/SentenceSplitter.js';
import RecursiveSplitter from '../splitters/RecursiveSplitter.js';
import PythonSplitter from '../splitters/language-aware/PythonSplitter.js';
import MarkdownSplitter from '../splitters/language-aware/MarkdownSplitter.js';
import { calculateMetrics } from '../utilis/metrics.js';
import SimpleTokenizer from '../utilis/tokenizer.js';

export class App {
  constructor() {
    // Initialize core components
    this.state = new StateManager();
    this.registry = SplitterRegistry;
    this.tokenizer = new SimpleTokenizer();

    // Register all splitters
    this._registerSplitters();

    // Initialize UI controller
    this.ui = new UIController(this.state);

    // Subscribe to state changes for UI-only updates
    this._subscribeToStateChanges();

    // Listen for manual split trigger
    this._setupSplitListener();
  }

  /**
   * Register all available splitters
   */
  _registerSplitters() {
    this.registry.register(new CharacterSplitter(), 'character');
    this.registry.register(new TokenSplitter(), 'token');
    this.registry.register(new SentenceSplitter(), 'sentence');
    this.registry.register(new RecursiveSplitter(), 'recursive');
    this.registry.register(new PythonSplitter(), 'python');
    this.registry.register(new MarkdownSplitter(), 'markdown');

    console.log(`✓ Registered ${this.registry.count()} splitters`);
  }

  /**
   * Setup listener for manual split trigger
   */
  _setupSplitListener() {
    document.addEventListener('split-triggered', (event) => {
      const { text, chunkSize, overlap, splitter, language } = event.detail;
      this._processText(text, chunkSize, overlap, splitter, language);
    });

    document.addEventListener('comparison-split-triggered', (event) => {
      const { text, chunkSize, overlap, language, splitter1, splitter2 } = event.detail;
      this._processComparison(text, chunkSize, overlap, language, splitter1, splitter2);
    });
  }

  _processComparison(inputText, chunkSize, overlap, language, splitter1Key, splitter2Key) {
    const getBaseSplitter = (key) => this.registry.get(key);

    const s1 = getBaseSplitter(splitter1Key);
    const s2 = getBaseSplitter(splitter2Key);

    if (!s1 || !s2) {
      console.error('Splitter not found for comparison');
      return;
    }

    setTimeout(() => {
      try {
        const chunks1 = s1.split(inputText, chunkSize, overlap, language);
        const chunks2 = s2.split(inputText, chunkSize, overlap, language);
        const metrics1 = calculateMetrics(inputText, chunks1);
        const metrics2 = calculateMetrics(inputText, chunks2);
        this.state.setState({ chunks: chunks1, metrics: metrics1 });
        this.ui.renderComparisonChunks(chunks1, chunks2, metrics1, metrics2, splitter1Key, splitter2Key);
        this.ui.renderMetrics(metrics1);
      } catch (err) {
        console.error('Comparison split error:', err);
      }
    }, 10);
  }

  /**
   * Subscribe to state changes for UI-only updates
   */
  _subscribeToStateChanges() {
    this.state.subscribe((newState, oldState) => {
      // Handle UI-only changes (not re-splitting)
      if (newState.showOverlap !== oldState.showOverlap ||
          newState.compactView !== oldState.compactView) {
        this.ui.renderChunks(newState.chunks);
      }
    });
  }

  /**
   * Process text with selected splitter
   * @param {string} inputText - Text to split
   * @param {number} chunkSize - Chunk size
   * @param {number} overlap - Overlap size
   * @param {string} selectedSplitter - Splitter type
   * @param {string} language - Language type
   */
  _processText(inputText, chunkSize, overlap, selectedSplitter, language) {
    try {
      // Show loading
      this.ui.showLoading();

      // Use setTimeout to prevent UI blocking
      setTimeout(() => {
        try {
          // Get appropriate splitter
          let splitter = this.registry.get(selectedSplitter);

          // For language-aware splitting, check if we have a language-specific splitter
          if (language !== 'plaintext') {
            const languageSplitter = this.registry.get(language);
            if (languageSplitter) {
              splitter = languageSplitter;
            }
          }

          if (!splitter) {
            throw new Error(`Splitter "${selectedSplitter}" not found`);
          }

          // Split the text
          const chunks = splitter.split(inputText, chunkSize, overlap, language);

          // Calculate metrics
          const metrics = calculateMetrics(inputText, chunks);

          // Add token count if using token splitter
          if (selectedSplitter === 'token') {
            metrics.totalTokens = this.tokenizer.countTokens(inputText);
          }

          // Update state
          this.state.setState({
            chunks: chunks,
            metrics: metrics,
            isProcessing: false
          });

          // Render results
          this.ui.renderChunks(chunks);
          this.ui.renderMetrics(metrics);

          console.log(`✓ Split into ${chunks.length} chunks`);

        } catch (error) {
          console.error('Error processing text:', error);
          this._showError(`Error: ${error.message}`);
          this.state.setState({ isProcessing: false });
        }
      }, 10);

    } catch (error) {
      console.error('Error in _processText:', error);
      this.state.setState({ isProcessing: false });
    }
  }

  /**
   * Show error message to user
   * @param {string} message - Error message
   */
  _showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <span>${message}</span>
    `;

    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      background: 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      zIndex: '10000',
      fontFamily: "'Inter', sans-serif",
      fontSize: '14px',
      fontWeight: '500',
      animation: 'slideIn 0.3s ease-out'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  /**
   * Initialize the application
   */
  init() {
    console.log('🚀 Text Splitter Visualizer initialized');
    console.log('Available splitters:', this.registry.getAllKeys());

    // Show initial empty state
    this.ui.renderChunks([]);
    this.ui.renderMetrics(null);

    // Add notification animation styles
    this._addNotificationStyles();
  }

  /**
   * Add notification animation styles
   */
  _addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get application info (for debugging)
   */
  getInfo() {
    return {
      splitters: this.registry.getSplitterInfoList(),
      state: this.state.getState()
    };
  }
}

export default App;