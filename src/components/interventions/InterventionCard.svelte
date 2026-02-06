<script>
  import { formatDate, formatPrice, formatKilometrage } from '../../lib/utils/format.js'
  import { TYPES_INTERVENTION, STATUTS_INTERVENTION } from '../../lib/db/interventions.js'

  let { intervention, onClick } = $props()

  let typeLabel = $derived(TYPES_INTERVENTION.find(t => t.value === intervention.type)?.label || intervention.type)
  let statutLabel = $derived(STATUTS_INTERVENTION.find(s => s.value === intervention.statut)?.label || intervention.statut)
</script>

<button class="intervention-card" onclick={() => onClick?.(intervention)}>
  <div class="intervention-header">
    <span class="intervention-type type-{intervention.type}">{typeLabel}</span>
    <span class="intervention-statut statut-{intervention.statut}">{statutLabel}</span>
  </div>
  <div class="intervention-content">
    <p class="intervention-description">{intervention.description}</p>
    <div class="intervention-meta">
      <span class="meta-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {formatDate(intervention.date)}
      </span>
      {#if intervention.kilometrage}
        <span class="meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {formatKilometrage(intervention.kilometrage)}
        </span>
      {/if}
      {#if intervention.cout}
        <span class="meta-item meta-price">
          {formatPrice(intervention.cout)}
        </span>
      {/if}
    </div>
  </div>
  <svg class="intervention-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
</button>

<style>
  .intervention-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    padding: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    position: relative;
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .intervention-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-color: var(--primary-color);
  }

  .intervention-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .intervention-type {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .type-entretien {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .type-reparation {
    background: #fef3c7;
    color: #b45309;
  }

  .intervention-statut {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .statut-en_attente {
    background: #e5e7eb;
    color: #4b5563;
  }

  .statut-en_cours {
    background: #fef3c7;
    color: #b45309;
  }

  .statut-termine {
    background: #d1fae5;
    color: #047857;
  }

  .intervention-content {
    flex: 1;
  }

  .intervention-description {
    font-size: 0.9375rem;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
    line-height: 1.4;
  }

  .intervention-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .meta-price {
    color: var(--primary-color);
    font-weight: 600;
  }

  .estimate {
    font-weight: 400;
    opacity: 0.7;
  }

  .intervention-chevron {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
  }
</style>
