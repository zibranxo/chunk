/**
 * Splitter Registry
 * Singleton pattern to manage all registered splitters
 */

export class SplitterRegistry {
  constructor() {
    // Implement singleton pattern
    if (SplitterRegistry.instance) {
      return SplitterRegistry.instance;
    }
    
    this.splitters = new Map();
    SplitterRegistry.instance = this;
  }
  
  /**
   * Register a splitter
   * @param {BaseSplitter} splitter - Splitter instance to register
   * @param {string} key - Optional custom key (defaults to splitter.name)
   */
  register(splitter, key = null) {
    const splitterKey = key || splitter.name;
    
    if (this.splitters.has(splitterKey)) {
      console.warn(`Splitter "${splitterKey}" is already registered. Overwriting.`);
    }
    
    this.splitters.set(splitterKey, splitter);
  }
  
  /**
   * Get a splitter by key
   * @param {string} key - Splitter key
   * @returns {BaseSplitter|null} - Splitter instance or null
   */
  get(key) {
    return this.splitters.get(key) || null;
  }
  
  /**
   * Check if a splitter exists
   * @param {string} key - Splitter key
   * @returns {boolean} - True if exists
   */
  has(key) {
    return this.splitters.has(key);
  }
  
  /**
   * Get all registered splitters
   * @returns {Array<BaseSplitter>} - Array of all splitters
   */
  getAll() {
    return Array.from(this.splitters.values());
  }
  
  /**
   * Get all splitter keys
   * @returns {Array<string>} - Array of splitter keys
   */
  getAllKeys() {
    return Array.from(this.splitters.keys());
  }
  
  /**
   * Unregister a splitter
   * @param {string} key - Splitter key
   * @returns {boolean} - True if removed
   */
  unregister(key) {
    return this.splitters.delete(key);
  }
  
  /**
   * Clear all splitters
   */
  clear() {
    this.splitters.clear();
  }
  
  /**
   * Get number of registered splitters
   * @returns {number} - Count of splitters
   */
  count() {
    return this.splitters.size;
  }
  
  /**
   * Get splitter info map (for UI display)
   * @returns {Array<Object>} - Array of {key, name, description}
   */
  getSplitterInfoList() {
    return Array.from(this.splitters.entries()).map(([key, splitter]) => ({
      key: key,
      name: splitter.name,
      description: splitter.description
    }));
  }
}

// Export singleton instance
const registry = new SplitterRegistry();
export default registry;