/**
 * Main Entry Point
 * Initialize the application when DOM is ready
 */

import App from './app/App.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = new App();
    app.init();

    // Expose for debugging
    window.chunkSplitApp = app;
    console.log('[CHUNK/SPLIT] Initialized');

  } catch (error) {
    console.error('[CHUNK/SPLIT] Failed to initialize:', error);
    showFatalError(error);
  }
});

function showFatalError(error) {
  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #1a1a1a;
    border: 1px solid #f45800;
    padding: 24px;
    font-family: 'IBM Plex Mono', monospace;
    color: #fff;
    font-size: 14px;
    z-index: 10000;
    max-width: 400px;
  `;
  el.innerHTML = `
    <div style="color: #f45800; font-weight: 600; margin-bottom: 12px;">FATAL ERROR</div>
    <div style="color: #888;">${error.message}</div>
    <div style="color: #666; margin-top: 12px; font-size: 12px;">Check console for details.</div>
  `;
  document.body.appendChild(el);
}