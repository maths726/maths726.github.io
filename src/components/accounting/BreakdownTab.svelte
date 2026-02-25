<script>
  import { formatPrice } from '../../lib/utils/format'

  let { componentData = [] } = $props()

  // Filtrer les éléments qui ne sont pas des totaux calculés
  const displayData = $derived(componentData.filter(item => !item.isTotal))
  const marginTotalData = $derived(componentData.find(item => item.isTotal))

  const calculateTotal = () => {
    return displayData.reduce((sum, item) => sum + (item.value || 0), 0)
  }

  const getBarColor = (index) => {
    const colors = ['#16588E', '#8B5CF6', '#10B981']
    return colors[index % colors.length]
  }
</script>

<div class="breakdown-container">
  <!-- Tableau récapitulatif -->
  <div class="section">
    <h3 class="section-title">Composition des coûts</h3>
    <div class="table-wrapper">
      <table class="breakdown-table">
        <thead>
          <tr>
            <th>Composant</th>
            <th class="text-right">Montant</th>
            <th class="text-right">% du total</th>
          </tr>
        </thead>
        <tbody>
          {#each displayData as item, index (index)}
            <tr class="table-row">
              <td class="component-name">{item.name}</td>
              <td class="text-right">{formatPrice(item.value)}</td>
              <td class="text-right">{item.percent?.toFixed(1) || 0}%</td>
            </tr>
          {/each}
          <tr class="table-row total-row">
            <td class="component-name"><strong>Total CA</strong></td>
            <td class="text-right"><strong>{formatPrice(calculateTotal())}</strong></td>
            <td class="text-right"><strong>100%</strong></td>
          </tr>
          {#if marginTotalData}
            <tr class="table-row margin-row">
              <td class="component-name"><strong>{marginTotalData.name}</strong></td>
              <td class="text-right"><strong>{formatPrice(marginTotalData.value)}</strong></td>
              <td class="text-right"><strong>{marginTotalData.percent?.toFixed(1) || 0}%</strong></td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Graphique barres horizontales -->
  <div class="section">
    <h3 class="section-title">Comparaison visuelle</h3>
    <div class="chart-container">
      <div class="bars-wrapper">
        {#each displayData as item, index (index)}
          <div class="bar-item">
            <div class="bar-label">
              <span class="label-name">{item.name}</span>
              <span class="label-value">{formatPrice(item.value)}</span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                style="width: {item.percent || 0}%; background-color: {getBarColor(index)};"
              ></div>
            </div>
            <div class="bar-percent">{item.percent?.toFixed(1) || 0}%</div>
          </div>
        {/each}
        {#if marginTotalData}
          <div class="bar-item margin-total-bar">
            <div class="bar-label">
              <span class="label-name">{marginTotalData.name}</span>
              <span class="label-value">{formatPrice(marginTotalData.value)}</span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                style="width: {marginTotalData.percent || 0}%; background-color: #10B981;"
              ></div>
            </div>
            <div class="bar-percent">{marginTotalData.percent?.toFixed(1) || 0}%</div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .breakdown-container {
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Table styles */
  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .breakdown-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }

  .breakdown-table thead {
    background: var(--bg-hover);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .breakdown-table th {
    padding: 0.875rem 1rem;
    text-align: left;
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid var(--border-color);
  }

  .breakdown-table td {
    padding: 0.875rem 1rem;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
  }

  .table-row:nth-child(even) {
    background: rgba(255, 255, 255, 0.02);
  }

  .table-row:hover {
    background: var(--bg-hover);
  }

  .total-row {
    background: linear-gradient(to right, rgba(0, 102, 177, 0.05), rgba(0, 102, 177, 0.02));
    border-top: 2px solid var(--border-color);
    font-weight: 600;
  }

  .margin-row {
    background: linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
    border-top: 1px dashed var(--border-color);
    border-bottom: 2px solid var(--border-color);
    font-weight: 600;
  }

  .margin-total-bar {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--border-color);
  }

  .component-name {
    font-weight: 500;
  }

  .text-right {
    text-align: right;
  }

  /* Chart styles */
  .chart-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .bars-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .bar-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .bar-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .label-name {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.95rem;
  }

  .label-value {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .bar-track {
    width: 100%;
    height: 28px;
    background: var(--bg-hover);
    border-radius: var(--radius-md);
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .bar-fill {
    height: 100%;
    border-radius: var(--radius-md);
    transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0.75rem;
    opacity: 0.95;
    min-width: 0;
  }

  .bar-percent {
    text-align: right;
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .section {
      padding: 1rem;
    }

    .breakdown-table th,
    .breakdown-table td {
      padding: 0.75rem 0.5rem;
      font-size: 0.85rem;
    }

    .bar-track {
      height: 24px;
    }

    .label-name {
      font-size: 0.9rem;
    }
  }
</style>
