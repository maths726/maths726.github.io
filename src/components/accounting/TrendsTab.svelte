<script>
  import { formatPrice } from '../../lib/utils/format'

  let {
    timeSeriesData = [],
    comparison = {},
    topClients = [],
    topVehicles = []
  } = $props()

  const formatGrowth = (value) => {
    if (!value) return '0%'
    return Math.abs(value).toFixed(1) + '%'
  }

  const getGrowthColor = (value) => {
    if (!value) return 'var(--text-secondary)'
    return value > 0 ? '#10B981' : '#EF4444'
  }

  const getGrowthIcon = (value) => {
    if (!value) return '→'
    return value > 0 ? '↗' : '↘'
  }
</script>

<div class="trends-container">
  <!-- Comparaison N/N-1 -->
  <div class="section">
    <h3 class="section-title">Comparaison année précédente</h3>
    <div class="comparison-grid">
      <div class="comparison-card">
        <div class="comparison-label">Croissance CA</div>
        <div class="comparison-value">
          <span
            class="growth-badge"
            style="color: {getGrowthColor(comparison.revenueGrowth)}"
          >
            {getGrowthIcon(comparison.revenueGrowth)} {formatGrowth(comparison.revenueGrowth)}
          </span>
        </div>
      </div>

      <div class="comparison-card">
        <div class="comparison-label">Croissance Marge</div>
        <div class="comparison-value">
          <span
            class="growth-badge"
            style="color: {getGrowthColor(comparison.marginGrowth)}"
          >
            {getGrowthIcon(comparison.marginGrowth)} {formatGrowth(comparison.marginGrowth)}
          </span>
        </div>
      </div>

      <div class="comparison-card">
        <div class="comparison-label">Croissance Interventions</div>
        <div class="comparison-value">
          <span
            class="growth-badge"
            style="color: {getGrowthColor(comparison.countGrowth)}"
          >
            {getGrowthIcon(comparison.countGrowth)} {formatGrowth(comparison.countGrowth)}
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Top 5 Clients -->
  <div class="section">
    <h3 class="section-title">Top 5 Clients</h3>
    <div class="list-container">
      {#if topClients && topClients.length > 0}
        <div class="ranking-list">
          {#each topClients.slice(0, 5) as client, idx}
            <div class="ranking-item">
              <div class="ranking-number">{idx + 1}</div>
              <div class="ranking-content">
                <div class="ranking-name">{client.name}</div>
                <div class="ranking-meta">{client.count} intervention{client.count > 1 ? 's' : ''}</div>
              </div>
              <div class="ranking-value">{formatPrice(client.revenue)}</div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          <p>Aucun client</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Top 5 Véhicules -->
  <div class="section">
    <h3 class="section-title">Top 5 Véhicules</h3>
    <div class="list-container">
      {#if topVehicles && topVehicles.length > 0}
        <div class="ranking-list">
          {#each topVehicles.slice(0, 5) as vehicle, idx}
            <div class="ranking-item">
              <div class="ranking-number">{idx + 1}</div>
              <div class="ranking-content">
                <div class="ranking-name">{vehicle.name}</div>
                <div class="ranking-meta">{vehicle.count} intervention{vehicle.count > 1 ? 's' : ''}</div>
              </div>
              <div class="ranking-value">{formatPrice(vehicle.revenue)}</div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          <p>Aucun véhicule</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .trends-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    border: 1px solid var(--border-color);
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: var(--text-primary);
  }

  /* Chart */
  .chart-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .line-chart {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .chart-placeholder {
    width: 100%;
    aspect-ratio: 2 / 1;
    background: var(--bg-hover);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .chart-svg {
    width: 100%;
    height: 100%;
    color: var(--text-primary);
  }

  .empty-chart {
    width: 100%;
    aspect-ratio: 2 / 1;
    background: var(--bg-hover);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .chart-legend {
    display: flex;
    gap: 2rem;
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  /* Comparaison */
  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .comparison-card {
    background: var(--bg-hover);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    border: 1px solid var(--border-color);
    transition: all var(--transition-fast);
  }

  .comparison-card:hover {
    border-color: var(--primary);
    box-shadow: 0 4px 12px rgba(0, 102, 177, 0.1);
  }

  .comparison-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .comparison-value {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .growth-badge {
    font-size: 1.75rem;
    font-weight: 700;
    font-feature-settings: "tnum" 1;
    transition: all var(--transition-fast);
  }

  /* Liste de classement */
  .list-container {
    display: flex;
    flex-direction: column;
  }

  .ranking-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .ranking-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    transition: all var(--transition-fast);
  }

  .ranking-item:hover {
    background: linear-gradient(to right, rgba(0, 102, 177, 0.05), transparent);
    border-color: var(--primary);
  }

  .ranking-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--primary-gradient);
    color: white;
    border-radius: 50%;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .ranking-content {
    flex: 1;
    min-width: 0;
  }

  .ranking-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ranking-meta {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .ranking-value {
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    text-align: right;
  }

  .empty-state {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .section {
      padding: 1rem;
    }

    .comparison-grid {
      grid-template-columns: 1fr;
    }

    .ranking-item {
      padding: 0.875rem;
      gap: 0.75rem;
    }

    .ranking-number {
      width: 28px;
      height: 28px;
      font-size: 0.85rem;
    }

    .ranking-value {
      font-size: 0.9rem;
    }
  }
</style>
