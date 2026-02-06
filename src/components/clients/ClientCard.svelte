<script>
  import { formatTelephone } from '../../lib/utils/format.js'

  let { client, vehiculeCount = 0, onClick } = $props()
</script>

<button class="client-card" onclick={() => onClick?.(client)}>
  <div class="client-avatar">
    {client.prenom?.[0] || ''}{client.nom?.[0] || '?'}
  </div>
  <div class="client-info">
    <h3 class="client-name">{client.prenom} {client.nom}</h3>
    <p class="client-phone">{formatTelephone(client.telephone)}</p>
    {#if vehiculeCount > 0}
      <span class="client-vehicules">
        {vehiculeCount} véhicule{vehiculeCount > 1 ? 's' : ''}
      </span>
    {/if}
  </div>
  <svg class="client-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
</button>

<style>
  .client-card {
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

  .client-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-color: var(--primary-color);
  }

  .client-avatar {
    width: 48px;
    height: 48px;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1rem;
    flex-shrink: 0;
    text-transform: uppercase;
  }

  .client-info {
    flex: 1;
    min-width: 0;
  }

  .client-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .client-phone {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
  }

  .client-vehicules {
    display: inline-block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--primary-color);
    background: var(--primary-light);
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
  }

  .client-chevron {
    color: var(--text-secondary);
    flex-shrink: 0;
  }
</style>
