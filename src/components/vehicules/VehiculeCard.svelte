<script>
  import { formatKilometrage, formatImmatriculation } from '../../lib/utils/format.js'

  let { vehicule, interventionCount = 0, onClick } = $props()
</script>

<button class="vehicule-card" onclick={() => onClick?.(vehicule)}>
  <div class="vehicule-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
      <circle cx="6.5" cy="16.5" r="2.5"/>
      <circle cx="16.5" cy="16.5" r="2.5"/>
    </svg>
  </div>
  <div class="vehicule-info">
    <h3 class="vehicule-name">{vehicule.marque} {vehicule.modele}</h3>
    <p class="vehicule-immat">{formatImmatriculation(vehicule.immatriculation)}</p>
    <div class="vehicule-details">
      {#if vehicule.annee}
        <span class="detail">{vehicule.annee}</span>
      {/if}
      {#if vehicule.kilometrage}
        <span class="detail">{formatKilometrage(vehicule.kilometrage)}</span>
      {/if}
    </div>
    {#if interventionCount > 0}
      <span class="vehicule-interventions">
        {interventionCount} intervention{interventionCount > 1 ? 's' : ''}
      </span>
    {/if}
  </div>
  <svg class="vehicule-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
</button>

<style>
  .vehicule-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .vehicule-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-color: var(--primary-color);
  }

  .vehicule-icon {
    width: 48px;
    height: 48px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .vehicule-info {
    flex: 1;
    min-width: 0;
  }

  .vehicule-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.125rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .vehicule-immat {
    font-size: 0.875rem;
    color: var(--primary-color);
    font-weight: 600;
    margin: 0 0 0.25rem;
    letter-spacing: 0.05em;
  }

  .vehicule-details {
    display: flex;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .detail {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .vehicule-interventions {
    display: inline-block;
    margin-top: 0.375rem;
    font-size: 0.75rem;
    color: var(--primary-color);
    background: var(--primary-lighter);
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
  }

  .vehicule-chevron {
    color: var(--text-secondary);
    flex-shrink: 0;
  }
</style>
