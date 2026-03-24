/**
 * State Manager
 * Central state management with observer pattern
 */

import CONFIG from '../constants/config.js';

export class StateManager {
  constructor() {
    // Initial state
    this.state = {
      inputText: '',
      language: CONFIG.DEFAULT_LANGUAGE,
      chunkSize: CONFIG.DEFAULT_CHUNK_SIZE,
      overlap: CONFIG.DEFAULT_OVERLAP,
      selectedSplitter: CONFIG.DEFAULT_SPLITTER,
      chunks: [],
      metrics: null,
      showOverlap: false,
      compactView: false,
      isProcessing: false
    };
    
    // Listeners (observers)
    this.listeners = [];
  }
  
  /**
   * Get current state
   * @returns {Object} - Current state object
   */
  getState() {
    return { ...this.state };
  }
  
  /**
   * Update state with partial updates
   * @param {Object} updates - Partial state updates
   */
  setState(updates) {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Notify all listeners
    this.notify(this.state, previousState);
  }
  
  /**
   * Get specific state value
   * @param {string} key - State key
   * @returns {*} - State value
   */
  get(key) {
    return this.state[key];
  }
  
  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function (newState, oldState) => void
   * @returns {Function} - Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all listeners of state change
   * @param {Object} newState - New state
   * @param {Object} oldState - Previous state
   */
  notify(newState, oldState) {
    this.listeners.forEach(listener => {
      try {
        listener(newState, oldState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }
  
  /**
   * Reset state to initial values
   */
  reset() {
    this.setState({
      inputText: '',
      language: CONFIG.DEFAULT_LANGUAGE,
      chunkSize: CONFIG.DEFAULT_CHUNK_SIZE,
      overlap: CONFIG.DEFAULT_OVERLAP,
      selectedSplitter: CONFIG.DEFAULT_SPLITTER,
      chunks: [],
      metrics: null,
      showOverlap: false,
      compactView: false,
      isProcessing: false
    });
  }
  
  /**
   * Get state as JSON (for debugging)
   * @returns {string} - JSON string
   */
  toJSON() {
    return JSON.stringify(this.state, null, 2);
  }
}

export default StateManager;