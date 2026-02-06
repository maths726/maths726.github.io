<script>
  import { onMount } from 'svelte'
  import Header from '../components/common/Header.svelte'
  import SearchBar from '../components/common/SearchBar.svelte'
  import VehiculeCard from '../components/vehicules/VehiculeCard.svelte'
  import EmptyState from '../components/common/EmptyState.svelte'
  import { vehicules } from '../lib/stores/vehicules.js'
  import { getAllClients } from '../lib/db/clients.js'
  import { getAllInterventions } from '../lib/db/interventions.js'

  let { navigate } = $props()

  let searchQuery = $state('')
  let clientsMap = $state({})
  let interventionCounts = $state({})

  onMount(async () => {
    await vehicules.load()
    const allClients = await getAllClients()
    clientsMap = allClients.reduce((acc, c) => {
      acc[c.id] = c
      return acc
    }, {})
    const allInterventions = await getAllInterventions()
    interventionCounts = allInterventions.reduce((acc, i) => {
      acc[i.vehiculeId] = (acc[i.vehiculeId] || 0) + 1
      return acc
    }, {})
  })

  async function handleSearch(query) {
    searchQuery = query
    await vehicules.search(query)
  }

  function handleVehiculeClick(vehicule) {
    navigate(`/vehicules/${vehicule.id}?from=vehicules`)
  }

  function getClientName(clientId) {
    const client = clientsMap[clientId]
    if (!client) return ''
    return client.prenom ? `${client.prenom} ${client.nom}` : client.nom
  }
</script>

<div class="page">
  <Header title="Vehicules" />

  <main class="main-content">
    <div class="toolbar">
      <SearchBar
        value={searchQuery}
        placeholder="Rechercher par immatriculation, marque..."
        onSearch={handleSearch}
      />
    </div>

    <div class="vehicule-list">
      {#if $vehicules.length === 0}
        <EmptyState
          icon="car"
          title={searchQuery ? "Aucun resultat" : "Aucun vehicule"}
          message={searchQuery ? "Aucun vehicule ne correspond a votre recherche" : "Ajoutez des vehicules depuis la page d'un client"}
        />
      {:else}
        <div class="list-container">
          {#each $vehicules as vehicule (vehicule.id)}
            <button class="vehicule-card-wrapper" onclick={() => handleVehiculeClick(vehicule)}>
              <div class="vehicule-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
                  <circle cx="6.5" cy="16.5" r="2.5"/>
                  <circle cx="16.5" cy="16.5" r="2.5"/>
                </svg>
              </div>
              <div class="vehicule-info">
                <h3 class="vehicule-name">{vehicule.marque} {vehicule.modele}</h3>
                <p class="vehicule-immat">{vehicule.immatriculation}</p>
                {#if getClientName(vehicule.clientId)}
                  <p class="vehicule-client">{getClientName(vehicule.clientId)}</p>
                {/if}
                <div class="vehicule-details">
                  {#if vehicule.annee}
                    <span class="detail">{vehicule.annee}</span>
                  {/if}
                  {#if interventionCounts[vehicule.id] > 0}
                    <span class="detail interventions">
                      {interventionCounts[vehicule.id]} intervention{interventionCounts[vehicule.id] > 1 ? 's' : ''}
                    </span>
                  {/if}
                </div>
              </div>
              <svg class="vehicule-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </main>
</div>

<style>
  .page {
    min-height: 100vh;
    background: var(--bg-primary);
  }

  .main-content {
    padding-bottom: 5rem;
  }

  .toolbar {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background: white;
    border-bottom: 1px solid var(--border-color);
  }

  .vehicule-list {
    padding: 1rem;
  }

  .list-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .vehicule-card-wrapper {
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

  .vehicule-card-wrapper:hover {
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

  .vehicule-client {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin: 0 0 0.25rem;
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

  .detail.interventions {
    color: var(--primary-color);
    background: var(--primary-lighter);
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
  }

  .vehicule-chevron {
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  @media (min-width: 768px) {
    .main-content {
      padding-left: 80px;
    }
  }
</style>
