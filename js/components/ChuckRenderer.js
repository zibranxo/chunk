/**
 * Chunk Renderer Component
 * Handles rendering of individual chunks with inline overlap highlighting
 */

// Chunk border colours (parallel to CSS data-color values)
const CHUNK_COLORS = [
  { border: '#f45800', bg: 'rgba(244,88,0,0.18)' },
  { border: '#0ea5e9', bg: 'rgba(14,165,233,0.18)' },
  { border: '#22c55e', bg: 'rgba(34,197,94,0.18)' },
  { border: '#a855f7', bg: 'rgba(168,85,247,0.18)' },
  { border: '#eab308', bg: 'rgba(234,179,8,0.18)' },
];

export class ChunkRenderer {

  /**
   * Build an HTML string that highlights the overlap region at the
   * start of a chunk (shared with the previous chunk).
   */
  static _buildOverlapHTML(chunk, prevChunk, colorIndex) {
    if (!prevChunk || !chunk.metadata?.hasOverlap) {
      return `<span>${ChunkRenderer._esc(chunk.text)}</span>`;
    }
    // Find longest common suffix of prevChunk.text that is a prefix of chunk.text
    const prev = prevChunk.text;
    const curr = chunk.text;
    let overlapLen = 0;
    for (let len = Math.min(prev.length, curr.length); len > 0; len--) {
      if (prev.slice(prev.length - len) === curr.slice(0, len)) {
        overlapLen = len;
        break;
      }
    }
    if (overlapLen === 0) {
      return `<span>${ChunkRenderer._esc(chunk.text)}</span>`;
    }
    const color = CHUNK_COLORS[(colorIndex - 1 + CHUNK_COLORS.length) % CHUNK_COLORS.length];
    const overlapPart = ChunkRenderer._esc(curr.slice(0, overlapLen));
    const restPart    = ChunkRenderer._esc(curr.slice(overlapLen));
    return (
      `<span class="inline-overlap" style="background:${color.bg};outline:1.5px solid ${color.border};border-radius:2px;" title="Overlap with Chunk #${colorIndex}">${overlapPart}</span>` +
      `<span>${restPart}</span>`
    );
  }

  static _esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /**
   * Render a single chunk element
   */
  static renderChunk(chunk, colorIndex, showOverlap = false, prevChunk = null) {
    const chunkEl = document.createElement('div');
    chunkEl.className = 'chunk';
    chunkEl.dataset.index = chunk.index;
    chunkEl.dataset.color = colorIndex % 5;

    if (chunk.metadata?.hasOverlap) chunkEl.classList.add('has-overlap');

    // Header
    const header = document.createElement('div');
    header.className = 'chunk-header';
    header.innerHTML = `
      <span class="chunk-index">Chunk #${chunk.index + 1}</span>
      <div class="chunk-header-right">
        <span class="chunk-size">${chunk.text.length} chars</span>
        <button class="chunk-copy-btn" title="Copy chunk text">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="1"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>`;

    const copyBtn = header.querySelector('.chunk-copy-btn');
    const CHECK_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const COPY_SVG  = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="1"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const doIt = () => { copyBtn.innerHTML = CHECK_SVG; copyBtn.classList.add('copied'); setTimeout(() => { copyBtn.innerHTML = COPY_SVG; copyBtn.classList.remove('copied'); }, 1500); };
      if (navigator.clipboard) { navigator.clipboard.writeText(chunk.text).then(doIt).catch(doIt); }
      else {
        const ta = Object.assign(document.createElement('textarea'), { value: chunk.text, style: 'position:fixed;opacity:0' });
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); doIt();
      }
    });

    // Content — inline overlap highlight when enabled
    const content = document.createElement('div');
    content.className = 'chunk-content';
    if (showOverlap && prevChunk) {
      content.innerHTML = this._buildOverlapHTML(chunk, prevChunk, colorIndex);
    } else {
      content.textContent = chunk.text;
    }

    chunkEl.appendChild(header);
    chunkEl.appendChild(content);
    chunkEl.appendChild(this._createMetadataTooltip(chunk));
    return chunkEl;
  }

  static _createMetadataTooltip(chunk) {
    const tooltip = document.createElement('div');
    tooltip.className = 'chunk-metadata hidden';
    const rows = [
      { label: 'Index', value: chunk.index },
      { label: 'Start', value: chunk.startIndex },
      { label: 'End',   value: chunk.endIndex },
      { label: 'Size',  value: `${chunk.text.length} chars` },
    ];
    if (chunk.metadata?.tokenCount)    rows.push({ label: 'Tokens',    value: chunk.metadata.tokenCount });
    if (chunk.metadata?.sentenceCount) rows.push({ label: 'Sentences', value: chunk.metadata.sentenceCount });
    tooltip.innerHTML = rows.map(r => `<div class="metadata-row"><span class="metadata-label">${r.label}:</span><span class="metadata-value">${r.value}</span></div>`).join('');
    return tooltip;
  }

  static renderAllChunks(chunks, container, showOverlap = false, compactView = false) {
    container.innerHTML = '';
    if (!chunks || chunks.length === 0) { this._renderEmptyState(container); return; }

    container.classList.toggle('compact', compactView);
    container.classList.toggle('show-overlap', showOverlap);

    // Search bar
    const bar = document.createElement('div');
    bar.className = 'chunk-search-bar';
    bar.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><input type="text" class="chunk-search-input" placeholder="Filter chunks…" /><span class="chunk-search-count">${chunks.length} chunks</span>`;
    const input   = bar.querySelector('.chunk-search-input');
    const countEl = bar.querySelector('.chunk-search-count');
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      let vis = 0;
      container.querySelectorAll('.chunk').forEach(el => {
        const show = !q || (el.querySelector('.chunk-content')?.textContent?.toLowerCase() || '').includes(q);
        el.style.display = show ? '' : 'none';
        if (show) vis++;
      });
      countEl.textContent = q ? `${vis} / ${chunks.length} chunks` : `${chunks.length} chunks`;
    });
    container.appendChild(bar);

    chunks.forEach((chunk, index) => {
      container.appendChild(this.renderChunk(chunk, index, showOverlap, index > 0 ? chunks[index - 1] : null));
    });
  }

  static _renderEmptyState(container) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">[ ]</div><p class="empty-text">Enter text and click SPLIT TEXT to see chunks</p></div>`;
  }

  static showLoading(container) {
    container.innerHTML = `<div class="chunk-loading"><div class="spinner"></div></div>`;
  }
}

export default ChunkRenderer;
