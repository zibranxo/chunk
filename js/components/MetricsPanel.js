/**
 * Metrics Panel Component
 */

export class MetricsPanel {
  static render(metrics) {
    if (!metrics) {
      this.renderEmpty();
      return;
    }

    this._updateMetric('metric-total-chars', metrics.totalCharacters.toLocaleString());
    this._updateMetric('metric-num-chunks', metrics.numberOfChunks);
    this._updateMetric('metric-avg-size', metrics.averageChunkSize);
    this._updateMetric('metric-min-max', `${metrics.minChunkSize} / ${metrics.maxChunkSize}`);
    this._updateMetric('metric-std-dev', metrics.standardDeviation);

    // Word count
    if (metrics.wordCount !== undefined) {
      this._updateMetric('metric-word-count', metrics.wordCount.toLocaleString());
      document.getElementById('metric-wordcount-card')?.classList.remove('hidden');
    }

    // Token count
    if (metrics.totalTokens != null) {
      const tokenCard = document.getElementById('metric-tokens');
      if (tokenCard) {
        tokenCard.classList.remove('hidden');
        this._updateMetric('metric-token-count', metrics.totalTokens.toLocaleString());
      }
    } else {
      document.getElementById('metric-tokens')?.classList.add('hidden');
    }

    // Distribution bar
    if (metrics.distribution) {
      document.getElementById('metric-dist-card')?.classList.remove('hidden');
      this._renderDistribution(metrics.distribution);
    }
  }

  static _updateMetric(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
      element.classList.add('updating');
      setTimeout(() => element.classList.remove('updating'), 300);
    }
  }

  static _renderDistribution(distribution) {
    const container = document.getElementById('metric-distribution');
    if (!container) return;
    container.closest('.metric-card')?.classList.remove('hidden');

    const max = Math.max(...distribution.map(b => b.count), 1);
    container.innerHTML = distribution.map(bucket => `
      <div class="dist-bar-row" title="${bucket.label}: ${bucket.count} chunks">
        <span class="dist-bar-label">${bucket.label}</span>
        <div class="dist-bar-track">
          <div class="dist-bar-fill" style="width:${(bucket.count / max) * 100}%"></div>
        </div>
        <span class="dist-bar-count">${bucket.count}</span>
      </div>
    `).join('');
  }

  static renderEmpty() {
    this._updateMetric('metric-total-chars', '0');
    this._updateMetric('metric-num-chunks', '0');
    this._updateMetric('metric-avg-size', '0');
    this._updateMetric('metric-min-max', '0 / 0');
    this._updateMetric('metric-std-dev', '0');
    this._updateMetric('metric-word-count', '0');
    document.getElementById('metric-tokens')?.classList.add('hidden');
    document.getElementById('metric-wordcount-card')?.classList.add('hidden');
    document.getElementById('metric-dist-card')?.classList.add('hidden');
  }
}

export default MetricsPanel;
