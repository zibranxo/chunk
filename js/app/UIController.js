/**
 * UI Controller — full rewrite with all features wired
 */

import { debounce } from '../utilis/debounce.js';
import { FileHandler } from '../utilis/fileHandler.js';
import { detectLanguageFromFilename } from '../constants/language.js';
import { getSplitterMetadata } from '../constants/splitterMetadata.js';
import ChunkRenderer from '../components/ChuckRenderer.js';
import MetricsPanel from '../components/MetricsPanel.js';

export class UIController {
  constructor(stateManager) {
    this.state = stateManager;
    this.elements = this._cacheElements();
    this._attachEventListeners();
    this._updateSplitterDescription();
    this._initTheme();
  }

  _cacheElements() {
    return {
      textInput:              document.getElementById('text-input'),
      fileUpload:             document.getElementById('file-upload'),
      dropZone:               document.getElementById('drop-zone'),
      fileName:               document.getElementById('file-name'),
      urlInput:               document.getElementById('url-input'),
      urlFetchBtn:            document.getElementById('url-fetch-btn'),
      languageSelect:         document.getElementById('language-select'),
      chunkSizeSlider:        document.getElementById('chunk-size'),
      chunkSizeValue:         document.getElementById('chunk-size-output'),
      overlapSlider:          document.getElementById('overlap'),
      overlapValue:           document.getElementById('overlap-output'),
      overlapMax:             document.getElementById('overlap-max'),
      overlapWarning:         document.getElementById('overlap-warning'),
      splitterSelect:         document.getElementById('splitter-select'),
      splitterDescription:    document.getElementById('splitter-description'),
      showOverlapCheckbox:    document.getElementById('show-overlap'),
      comparisonModeCheckbox: document.getElementById('comparison-mode'),
      toggleCompactBtn:       document.getElementById('toggle-compact'),
      clearBtn:               document.getElementById('clear-btn'),
      themeToggleBtn:         document.getElementById('theme-toggle'),
      chunkContainer:         document.getElementById('chunk-container'),
      singleView:             document.getElementById('single-view'),
      comparisonView:         document.getElementById('comparison-view'),
      comparisonStats:        document.getElementById('comparison-stats'),
      cmpStat1:               document.getElementById('cmp-stat-1'),
      cmpStatDelta:           document.getElementById('cmp-stat-delta'),
      cmpStat2:               document.getElementById('cmp-stat-2'),
      chunks1:                document.getElementById('chunks-1'),
      chunks2:                document.getElementById('chunks-2'),
      splitter1Select:        document.getElementById('splitter-1-select'),
      splitter2Select:        document.getElementById('splitter-2-select'),
      exportJsonBtn:          document.getElementById('export-json-btn'),
      exportTxtBtn:           document.getElementById('export-txt-btn'),
      exportCsvBtn:           document.getElementById('export-csv-btn'),
      copyArrayBtn:           document.getElementById('copy-array-btn'),
      counterChars:           document.getElementById('counter-chars'),
      counterWords:           document.getElementById('counter-words'),
      counterTokens:          document.getElementById('counter-tokens'),
      sampleButtons:          document.querySelectorAll('.sample-btn'),
      splitBtn:               document.getElementById('split-btn'),
    };
  }

  _attachEventListeners() {
    // Text input + live counter
    this.elements.textInput.addEventListener('input', (e) => {
      const val = e.target.value;
      this.state.setState({ inputText: val });
      this._updateCounter(val);
    });

    // File upload
    this.elements.fileUpload.addEventListener('change', this._handleFileUpload.bind(this));

    // Drag and drop
    if (this.elements.dropZone) {
      const dz = this.elements.dropZone;
      dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('drag-over'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
      dz.addEventListener('drop', (e) => {
        e.preventDefault();
        dz.classList.remove('drag-over');
        const file = e.dataTransfer?.files?.[0];
        if (file) this._processFile(file);
      });
    }

    // URL fetch
    if (this.elements.urlFetchBtn) {
      this.elements.urlFetchBtn.addEventListener('click', () => this._fetchURL());
    }
    if (this.elements.urlInput) {
      this.elements.urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this._fetchURL();
      });
    }

    // Language select
    this.elements.languageSelect.addEventListener('change', (e) => {
      this.state.setState({ language: e.target.value });
    });

    // Chunk size slider
    this.elements.chunkSizeSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this._updateSliderDisplay('chunk-size', value);
      this.state.setState({ chunkSize: value });
      if (this.elements.overlapMax) this.elements.overlapMax.textContent = value;
      this.elements.overlapSlider.max = value;
      this._checkOverlapWarning();
    });

    // Overlap slider
    this.elements.overlapSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this._updateSliderDisplay('overlap', value);
      this.state.setState({ overlap: value });
      this._checkOverlapWarning();
    });

    // Splitter select
    this.elements.splitterSelect.addEventListener('change', (e) => {
      this.state.setState({ selectedSplitter: e.target.value });
      this._updateSplitterDescription();
    });

    // Show overlap checkbox
    this.elements.showOverlapCheckbox.addEventListener('change', (e) => {
      this.state.setState({ showOverlap: e.target.checked });
    });

    // Comparison mode checkbox
    if (this.elements.comparisonModeCheckbox) {
      this.elements.comparisonModeCheckbox.addEventListener('change', (e) => {
        this._toggleComparisonMode(e.target.checked);
      });
    }

    // Comparison column selects
    if (this.elements.splitter1Select) {
      this.elements.splitter1Select.addEventListener('change', () => this._triggerComparisonSplit());
    }
    if (this.elements.splitter2Select) {
      this.elements.splitter2Select.addEventListener('change', () => this._triggerComparisonSplit());
    }

    // Toggle compact
    this.elements.toggleCompactBtn.addEventListener('click', () => {
      const current = this.state.get('compactView');
      this.state.setState({ compactView: !current });
      this.elements.toggleCompactBtn.classList.toggle('active');
    });

    // Clear
    if (this.elements.clearBtn) {
      this.elements.clearBtn.addEventListener('click', () => this._clearAll());
    }

    // Theme toggle
    if (this.elements.themeToggleBtn) {
      this.elements.themeToggleBtn.addEventListener('click', () => this._toggleTheme());
    }

    // Exports
    if (this.elements.exportJsonBtn)  this.elements.exportJsonBtn.addEventListener('click',  () => this._exportJSON());
    if (this.elements.exportTxtBtn)   this.elements.exportTxtBtn.addEventListener('click',   () => this._exportTXT());
    if (this.elements.exportCsvBtn)   this.elements.exportCsvBtn.addEventListener('click',   () => this._exportCSV());
    if (this.elements.copyArrayBtn)   this.elements.copyArrayBtn.addEventListener('click',   () => this._copyArray());

    // Sample buttons
    this.elements.sampleButtons.forEach(btn => {
      btn.addEventListener('click', () => this._loadSample(btn.dataset.sample));
    });

    // Split button
    if (this.elements.splitBtn) {
      this.elements.splitBtn.addEventListener('click', () => this._triggerSplit());
    }

    // Ctrl+Enter
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); this._triggerSplit(); }
    });
  }

  // ─── Live counter ──────────────────────────────────────────────────────────
  _updateCounter(text) {
    if (!text) text = '';
    const chars  = text.length;
    const words  = text.trim() ? (text.match(/\b\w+\b/g) || []).length : 0;
    const tokens = Math.ceil(chars / 4);
    if (this.elements.counterChars)  this.elements.counterChars.textContent  = `${chars.toLocaleString()} chars`;
    if (this.elements.counterWords)  this.elements.counterWords.textContent  = `${words.toLocaleString()} words`;
    if (this.elements.counterTokens) this.elements.counterTokens.textContent = `~${tokens.toLocaleString()} tokens`;
  }

  // ─── Theme ─────────────────────────────────────────────────────────────────
  _initTheme() {
    const saved = localStorage.getItem('chunkSplitTheme');
    if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
  }

  _toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('chunkSplitTheme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('chunkSplitTheme', 'light');
    }
  }

  // ─── Comparison mode ───────────────────────────────────────────────────────
  _toggleComparisonMode(enabled) {
    this.state.setState({ comparisonMode: enabled });
    if (enabled) {
      this.elements.singleView.classList.add('hidden');
      this.elements.comparisonView.classList.remove('hidden');
      this._triggerComparisonSplit();
    } else {
      this.elements.singleView.classList.remove('hidden');
      this.elements.comparisonView.classList.add('hidden');
      if (this.elements.comparisonStats) this.elements.comparisonStats.classList.add('hidden');
    }
  }

  _triggerComparisonSplit() {
    const inputText = this.state.get('inputText');
    if (!inputText || inputText.trim() === '') return;
    document.dispatchEvent(new CustomEvent('comparison-split-triggered', {
      detail: {
        text: inputText,
        chunkSize: this.state.get('chunkSize'),
        overlap:   this.state.get('overlap'),
        language:  this.state.get('language'),
        splitter1: this.elements.splitter1Select?.value || 'character',
        splitter2: this.elements.splitter2Select?.value || 'token',
      }
    }));
  }

  // ─── Comparison render ─────────────────────────────────────────────────────
  renderComparisonChunks(chunks1, chunks2, metrics1, metrics2, key1, key2) {
    const showOverlap = this.state.get('showOverlap');

    const renderCol = (container, chunks) => {
      container.innerHTML = '';
      if (!chunks || chunks.length === 0) {
        container.innerHTML = '<p style="padding:1rem;opacity:.5;font-family:var(--font-mono);font-size:.7rem">No chunks</p>';
        return;
      }
      chunks.forEach((chunk, i) => {
        container.appendChild(ChunkRenderer.renderChunk(chunk, i, showOverlap, i > 0 ? chunks[i-1] : null));
      });
    };

    if (this.elements.chunks1) renderCol(this.elements.chunks1, chunks1);
    if (this.elements.chunks2) renderCol(this.elements.chunks2, chunks2);

    // Stats banner
    this._renderComparisonStats(chunks1, chunks2, metrics1, metrics2, key1, key2);
  }

  _renderComparisonStats(chunks1, chunks2, m1, m2, key1, key2) {
    const stats = this.elements.comparisonStats;
    if (!stats) return;
    stats.classList.remove('hidden');

    const label1 = key1 ? key1.charAt(0).toUpperCase() + key1.slice(1) : 'Splitter 1';
    const label2 = key2 ? key2.charAt(0).toUpperCase() + key2.slice(1) : 'Splitter 2';

    const n1 = chunks1?.length || 0;
    const n2 = chunks2?.length || 0;
    const delta = n2 - n1;
    const pct   = n1 > 0 ? Math.round(Math.abs(delta) / n1 * 100) : 0;
    const sign  = delta > 0 ? '+' : '';
    const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '=';
    const deltaColor = delta > 0 ? 'var(--chunk-2)' : delta < 0 ? 'var(--chunk-1)' : 'var(--text-tertiary)';

    if (this.elements.cmpStat1) {
      this.elements.cmpStat1.innerHTML = `
        <span class="cmp-label">${label1}</span>
        <span class="cmp-big">${n1}</span>
        <span class="cmp-sub">chunks · avg ${m1?.averageChunkSize ?? 0} ch</span>`;
    }
    if (this.elements.cmpStatDelta) {
      this.elements.cmpStatDelta.innerHTML = `
        <span class="cmp-arrow" style="color:${deltaColor}">${arrow}</span>
        <span class="cmp-delta" style="color:${deltaColor}">${sign}${delta} chunks (${sign}${pct}%)</span>
        <span class="cmp-sub">${label2} vs ${label1}</span>`;
    }
    if (this.elements.cmpStat2) {
      this.elements.cmpStat2.innerHTML = `
        <span class="cmp-label">${label2}</span>
        <span class="cmp-big">${n2}</span>
        <span class="cmp-sub">chunks · avg ${m2?.averageChunkSize ?? 0} ch</span>`;
    }
  }

  // ─── Slider display ────────────────────────────────────────────────────────
  _updateSliderDisplay(sliderId, value) {
    const idMap = { 'chunk-size': 'chunk-size-output', 'overlap': 'overlap-output' };
    const el = document.getElementById(idMap[sliderId] || `${sliderId}-output`);
    if (el) { el.textContent = value; el.classList.add('pulse'); setTimeout(() => el.classList.remove('pulse'), 200); }
  }

  // ─── Split ─────────────────────────────────────────────────────────────────
  _triggerSplit() {
    const inputText = this.state.get('inputText');
    if (!inputText || inputText.trim() === '') {
      this._showNotification('Please enter some text to split', 'warning');
      return;
    }
    if (this.state.get('comparisonMode')) {
      this._triggerComparisonSplit();
    } else {
      document.dispatchEvent(new CustomEvent('split-triggered', {
        detail: {
          text:      inputText,
          chunkSize: this.state.get('chunkSize'),
          overlap:   this.state.get('overlap'),
          splitter:  this.state.get('selectedSplitter'),
          language:  this.state.get('language'),
        }
      }));
    }
    if (this.elements.splitBtn) {
      this.elements.splitBtn.classList.add('processing');
      setTimeout(() => this.elements.splitBtn.classList.remove('processing'), 500);
    }
  }

  // ─── Clear ─────────────────────────────────────────────────────────────────
  _clearAll() {
    this.state.setState({ inputText: '', chunks: [], metrics: null });
    this.elements.textInput.value = '';
    this.elements.fileName.textContent = '';
    this.elements.fileUpload.value = '';
    if (this.elements.urlInput) this.elements.urlInput.value = '';
    this._updateCounter('');
    ChunkRenderer.renderAllChunks([], this.elements.chunkContainer, false, false);
    MetricsPanel.renderEmpty();
    if (this.elements.chunks1) this.elements.chunks1.innerHTML = '';
    if (this.elements.chunks2) this.elements.chunks2.innerHTML = '';
    if (this.elements.comparisonStats) this.elements.comparisonStats.classList.add('hidden');
    [this.elements.exportJsonBtn, this.elements.exportTxtBtn,
     this.elements.exportCsvBtn,  this.elements.copyArrayBtn].forEach(b => b && (b.disabled = true));
    this._showNotification('Cleared', 'info');
  }

  // ─── Exports ───────────────────────────────────────────────────────────────
  _exportJSON() {
    const chunks = this.state.get('chunks');
    if (!chunks?.length) return;
    const data = {
      metadata: { splitter: this.state.get('selectedSplitter'), chunkSize: this.state.get('chunkSize'), overlap: this.state.get('overlap'), language: this.state.get('language'), totalChunks: chunks.length, exportedAt: new Date().toISOString() },
      chunks: chunks.map((c, i) => ({ index: i, text: c.text, startIndex: c.startIndex, endIndex: c.endIndex, length: c.text.length }))
    };
    this._downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'chunks.json');
  }

  _exportTXT() {
    const chunks = this.state.get('chunks');
    if (!chunks?.length) return;
    const text = chunks.map((c, i) => `=== Chunk ${i + 1} (${c.text.length} chars) ===\n${c.text}`).join('\n\n');
    this._downloadBlob(new Blob([text], { type: 'text/plain' }), 'chunks.txt');
  }

  _exportCSV() {
    const chunks = this.state.get('chunks');
    if (!chunks?.length) return;
    const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const rows = [
      ['index', 'text', 'start_index', 'end_index', 'length', 'has_overlap'].map(esc).join(','),
      ...chunks.map((c, i) => [i, c.text, c.startIndex, c.endIndex, c.text.length, c.metadata?.hasOverlap ? 1 : 0].map(esc).join(','))
    ];
    this._downloadBlob(new Blob([rows.join('\n')], { type: 'text/csv' }), 'chunks.csv');
  }

  _copyArray() {
    const chunks = this.state.get('chunks');
    if (!chunks?.length) return;
    const arr = JSON.stringify(chunks.map(c => c.text), null, 2);
    const btn = this.elements.copyArrayBtn;
    const doIt = () => {
      const orig = btn.innerHTML;
      btn.innerHTML = btn.innerHTML.replace('[ ]', '✓');
      setTimeout(() => { btn.innerHTML = orig; }, 1500);
      this._showNotification('Copied as array!', 'info');
    };
    if (navigator.clipboard) { navigator.clipboard.writeText(arr).then(doIt); }
    else {
      const ta = Object.assign(document.createElement('textarea'), { value: arr, style: 'position:fixed;opacity:0' });
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); doIt();
    }
  }

  _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── URL fetch ─────────────────────────────────────────────────────────────
  async _fetchURL() {
    const url = this.elements.urlInput?.value?.trim();
    if (!url) { this._showNotification('Enter a URL first', 'warning'); return; }

    const btn = this.elements.urlFetchBtn;
    const origText = btn.innerHTML;
    btn.innerHTML = btn.innerHTML.replace('FETCH', '…');
    btn.disabled = true;

    try {
      // Use a CORS proxy for general URLs
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const html = json.contents || '';

      // Strip HTML tags to get plain text
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      // Remove script/style elements
      tmp.querySelectorAll('script,style,nav,header,footer').forEach(el => el.remove());
      const text = (tmp.innerText || tmp.textContent || '').replace(/\n{3,}/g, '\n\n').trim();

      if (!text) throw new Error('No readable text found on that page');

      this.state.setState({ inputText: text });
      this.elements.textInput.value = text;
      this._updateCounter(text);
      this.elements.fileName.textContent = `↳ ${url.replace(/^https?:\/\//, '').slice(0, 40)}`;
      this.elements.fileName.style.color = 'var(--accent)';
      this._showNotification(`Fetched ${text.length.toLocaleString()} chars`, 'info');
    } catch (err) {
      this._showNotification(`Fetch failed: ${err.message}`, 'warning');
    } finally {
      btn.innerHTML = origText;
      btn.disabled = false;
    }
  }

  // ─── File handling ─────────────────────────────────────────────────────────
  async _handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) this._processFile(file);
  }

  async _processFile(file) {
    try {
      FileHandler.validateFile(file);
      const text = await FileHandler.readTextFile(file);
      const language = detectLanguageFromFilename(file.name);
      this.state.setState({ inputText: text, language });
      this.elements.textInput.value = text;
      this.elements.languageSelect.value = language;
      this.elements.fileName.textContent = `${file.name} (${FileHandler.formatFileSize(file.size)})`;
      this.elements.fileName.style.color = 'var(--accent)';
      this._updateCounter(text);
      this._showNotification('File loaded!', 'info');
    } catch (err) {
      this._showNotification(`Error: ${err.message}`, 'warning');
    }
  }

  // ─── Samples ───────────────────────────────────────────────────────────────
  _loadSample(sampleType) {
    const samples = {
      plain: `One of the most important things I didn't understand about the world when I was a child is the degree to which the returns for performance are superlinear.\n\nTeachers and coaches implicitly told us the returns were linear. "You get out," I heard a thousand times, "what you put in." They meant well, but this is rarely true. If your product is only half as good as your competitor's, you don't get half as many customers. You get no customers, and you go out of business.\n\nIt's obviously true that the returns for performance are superlinear in business. Some think this is a flaw of capitalism, and that if we changed the rules it would stop being true. But superlinear returns for performance are a feature of the world, not an artifact of rules we've invented.`,
      python: `def calculate_fibonacci(n):\n    """\n    Calculate the nth Fibonacci number using dynamic programming.\n    Args:\n        n: The position in the Fibonacci sequence\n    Returns:\n        The nth Fibonacci number\n    """\n    if n <= 1:\n        return n\n    fib = [0] * (n + 1)\n    fib[1] = 1\n    for i in range(2, n + 1):\n        fib[i] = fib[i-1] + fib[i-2]\n    return fib[n]\n\nclass FibonacciGenerator:\n    def __init__(self):\n        self.cache = {}\n    def get(self, n):\n        if n in self.cache:\n            return self.cache[n]\n        result = calculate_fibonacci(n)\n        self.cache[n] = result\n        return result`,
      markdown: `# Text Splitting for RAG Applications\n\n## Introduction\n\nText splitting is a crucial preprocessing step in Retrieval-Augmented Generation (RAG) systems. The way you chunk your documents directly impacts retrieval quality.\n\n## Key Considerations\n\n### Chunk Size\n\nThe optimal chunk size depends on:\n- Your embedding model's context window\n- The semantic density of your content\n- Your retrieval use case\n\n### Overlap Strategy\n\nOverlap helps maintain context across chunk boundaries:\n- Too little: lose important connections\n- Too much: redundancy and increased costs\n\n## Best Practices\n\n1. Start with 500-1000 character chunks\n2. Use 10-20% overlap\n3. Test with your specific use case\n4. Monitor retrieval metrics`
    };
    const text = samples[sampleType] || samples.plain;
    const language = sampleType === 'python' ? 'python' : sampleType === 'markdown' ? 'markdown' : 'plaintext';
    this.state.setState({ inputText: text, language });
    this.elements.textInput.value = text;
    this.elements.languageSelect.value = language;
    this.elements.fileName.textContent = '';
    this._updateCounter(text);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  _checkOverlapWarning() {
    const chunkSize = this.state.get('chunkSize');
    const overlap   = this.state.get('overlap');
    if (this.elements.overlapWarning) {
      overlap >= chunkSize
        ? this.elements.overlapWarning.classList.remove('hidden')
        : this.elements.overlapWarning.classList.add('hidden');
    }
  }

  _updateSplitterDescription() {
    const metadata = getSplitterMetadata(this.state.get('selectedSplitter'));
    if (this.elements.splitterDescription) {
      this.elements.splitterDescription.textContent = metadata.description;
    }
  }

  _showNotification(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `notification notification-${type}`;
    el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>${message}</span>`;
    Object.assign(el.style, {
      position: 'fixed', top: '20px', right: '20px', padding: '12px 20px',
      background: type === 'warning' ? 'rgba(245,158,11,0.95)' : 'rgba(34,197,94,0.95)',
      color: '#000', borderRadius: '4px', display: 'flex', alignItems: 'center',
      gap: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: '10000',
      fontFamily: "var(--font-mono)", fontSize: '0.75rem', fontWeight: '500',
      animation: 'slideIn 0.2s ease-out'
    });
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.2s'; setTimeout(() => el.remove(), 200); }, 2500);
  }

  // ─── Public render API ─────────────────────────────────────────────────────
  renderChunks(chunks) {
    const showOverlap = this.state.get('showOverlap');
    const compactView = this.state.get('compactView');
    ChunkRenderer.renderAllChunks(chunks, this.elements.chunkContainer, showOverlap, compactView);
    const has = chunks?.length > 0;
    [this.elements.exportJsonBtn, this.elements.exportTxtBtn,
     this.elements.exportCsvBtn,  this.elements.copyArrayBtn].forEach(b => b && (b.disabled = !has));
  }

  renderMetrics(metrics) {
    MetricsPanel.render(metrics);
  }

  showLoading() {
    ChunkRenderer.showLoading(this.elements.chunkContainer);
  }
}

export default UIController;
