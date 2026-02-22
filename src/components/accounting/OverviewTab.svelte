<script>
  import { formatPrice } from '../../lib/utils/format'
  import ChartWrapper from './ChartWrapper.svelte'

  let {
    metrics = {},
    timeSeriesData = [],
    componentData = []
  } = $props()

  // Icônes SVG réutilisables
  const icons = {
    euro: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M15.5 8.5h-7a1.5 1.5 0 000 3h7a1.5 1.5 0 010 3h-7a1.5 1.5 0 000 3h7"/></svg>',
    trendingUp: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    percent: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2"/><line x1="18" y1="18" x2="18" y2="18"/><circle cx="18" cy="18" r="2"/><path d="M4 20l16-16"/></svg>',
    wrench: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
  }

  // Fonction pour obtenir la couleur d'une icône KPI
  const getKPIColor = (type) => {
    switch(type) {
      case 'revenue':
        return 'var(--primary-color)'
      case 'margin':
        return 'var(--accent-green)'
      case 'marginPercent':
        return 'var(--primary-light)'
      case 'intervention':
        return 'var(--accent-orange)'
      default:
        return 'var(--primary-color)'
    }
  }

  // Fonction pour obtenir les couleurs CSS
  const getCSSColor = (cssVar) => {
    try {
      return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
    } catch {
      return '#16588E'
    }
  }

  // Données pour le graphique en ligne
  let lineChartData = $derived({
    labels: timeSeriesData.map(item => item.label || item.period || ''),
    datasets: [{
      label: 'Chiffre d\'affaires',
      data: timeSeriesData.map(item => item.revenue || 0),
      borderColor: '#16588E',
      backgroundColor: 'rgba(22, 88, 142, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#16588E',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  })

  let lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatPrice(value)
          }
        }
      }
    }
  }

  // Données pour le graphique donut
  let doughnutChartData = $derived({
    labels: componentData.map(item => item.name),
    datasets: [{
      data: componentData.map(item => item.value || 0),
      backgroundColor: [
        '#16588E',
        '#8B5CF6',
        '#10B981'
      ],
      borderColor: '#fff',
      borderWidth: 2
    }]
  })

  let doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatPrice(context.raw)
          }
        }
      }
    }
  }
</script>

<div class="overview-container">
  <!-- Section KPIs -->
  <div class="kpis-grid">
    <!-- KPI: Chiffre d'affaires -->
    <div class="kpi-card">
      <div class="kpi-header">
        <div class="kpi-icon" style="background-color: {getKPIColor('revenue')}; opacity: 0.15;">
          {@html icons.euro}
        </div>
        <div class="kpi-label">Chiffre d'affaires</div>
      </div>
      <div class="kpi-value">{formatPrice(metrics.revenue || 0)}</div>
    </div>

    <!-- KPI: Marge totale -->
    <div class="kpi-card">
      <div class="kpi-header">
        <div class="kpi-icon" style="background-color: {getKPIColor('margin')}; opacity: 0.15;">
          {@html icons.trendingUp}
        </div>
        <div class="kpi-label">Marge totale</div>
      </div>
      <div class="kpi-value">{formatPrice(metrics.margin || 0)}</div>
    </div>

    <!-- KPI: Taux de marge -->
    <div class="kpi-card">
      <div class="kpi-header">
        <div class="kpi-icon" style="background-color: {getKPIColor('marginPercent')}; opacity: 0.15;">
          {@html icons.percent}
        </div>
        <div class="kpi-label">Taux de marge</div>
      </div>
      <div class="kpi-value">{(metrics.marginPercent || 0).toFixed(1)}%</div>
    </div>

    <!-- KPI: Interventions -->
    <div class="kpi-card">
      <div class="kpi-header">
        <div class="kpi-icon" style="background-color: {getKPIColor('intervention')}; opacity: 0.15;">
          {@html icons.wrench}
        </div>
        <div class="kpi-label">Interventions</div>
      </div>
      <div class="kpi-value">{metrics.interventionCount || 0}</div>
    </div>
  </div>

  <!-- Section Graphique évolution CA -->
  <div class="section">
    <h3 class="section-title">Évolution du chiffre d'affaires</h3>
    <div class="chart-container">
      {#if timeSeriesData && timeSeriesData.length > 0}
        <div class="line-chart-wrapper">
          <ChartWrapper type="line" data={lineChartData} options={lineChartOptions} />
        </div>
      {:else}
        <div class="empty-chart">
          <p>Aucune donnée disponible</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Section Graphique répartition (Doughnut) -->
  <div class="section">
    <h3 class="section-title">Répartition des composants</h3>
    <div class="chart-container">
      {#if componentData && componentData.length > 0}
        <div class="doughnut-chart-wrapper">
          <ChartWrapper type="doughnut" data={doughnutChartData} options={doughnutChartOptions} />
        </div>
      {:else}
        <div class="empty-chart">
          <p>Aucune donnée disponible</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .overview-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* KPIs Grid */
  .kpis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  .kpi-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-sm);
  }

  .kpi-card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }

  .kpi-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .kpi-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: currentColor;
  }

  .kpi-icon :global(svg) {
    width: 24px;
    height: 24px;
    stroke: currentColor;
  }

  .kpi-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .kpi-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
  }

  /* Sections */
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

  /* Chart styles */
  .chart-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .line-chart-wrapper {
    width: 100%;
    height: 400px;
  }

  .doughnut-chart-wrapper {
    width: 100%;
    height: 350px;
    display: flex;
    justify-content: center;
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

  /* Responsive */
  @media (max-width: 768px) {
    .kpis-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .kpi-card {
      padding: 1rem;
      gap: 0.75rem;
    }

    .kpi-value {
      font-size: 1.5rem;
    }

    .kpi-label {
      font-size: 0.8rem;
    }

    .kpi-icon {
      width: 40px;
      height: 40px;
    }

    .line-chart-wrapper {
      height: 300px;
    }

    .doughnut-chart-wrapper {
      height: 300px;
    }
  }

  @media (max-width: 640px) {
    .kpis-grid {
      grid-template-columns: 1fr;
    }

    .section {
      padding: 1rem;
    }

    .section-title {
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .line-chart-wrapper {
      height: 250px;
    }

    .doughnut-chart-wrapper {
      height: 250px;
    }
  }
</style>
