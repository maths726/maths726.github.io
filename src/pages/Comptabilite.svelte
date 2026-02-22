<script>
  import { onMount } from 'svelte'
  import Header from '../components/common/Header.svelte'
  import FilterBar from '../components/accounting/FilterBar.svelte'
  import OverviewTab from '../components/accounting/OverviewTab.svelte'
  import BreakdownTab from '../components/accounting/BreakdownTab.svelte'
  import TrendsTab from '../components/accounting/TrendsTab.svelte'
  import DetailsTab from '../components/accounting/DetailsTab.svelte'
  import { getAllInterventions } from '../lib/db/interventions.js'
  import { getAllClients, getClient } from '../lib/db/clients.js'
  import { getAllVehicules, getVehicule } from '../lib/db/vehicules.js'
  import { filterInterventions, groupByPeriod, aggregateFinancials } from '../lib/accounting/aggregations.js'
  import { calculateKPIs, calculatePeriodComparison, calculateComponentRatios, getTopItems, calculateMarginRates } from '../lib/accounting/calculations.js'

  let { navigate } = $props()

  // Onglets disponibles
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'breakdown', label: 'Composition' },
    { id: 'trends', label: 'Tendances' },
    { id: 'details', label: 'Détails' }
  ]

  // État
  let activeTab = $state('overview')
  let isLoading = $state(true)

  // Données brutes
  let allInterventions = $state([])
  let allClients = $state([])
  let allVehicules = $state([])

  // Filtres courants
  let currentFilters = $state({
    dateRange: '3months',
    clientId: '',
    vehiculeId: ''
  })

  // Maps pour lookup rapide
  let clientsMap = $derived(new Map(allClients.map(c => [c.id, c])))
  let vehiculesMap = $derived(new Map(allVehicules.map(v => [v.id, v])))

  // Interventions avec clientId ajouté (via vehicule)
  let interventionsWithClient = $derived(
    allInterventions.map(intervention => {
      const vehicule = vehiculesMap.get(intervention.vehiculeId)
      return {
        ...intervention,
        clientId: vehicule?.clientId || null
      }
    })
  )

  // Interventions filtrées
  let filteredInterventions = $derived(
    filterInterventions(interventionsWithClient, currentFilters)
  )

  // Données agrégées
  let aggregated = $derived(aggregateFinancials(filteredInterventions))

  // KPIs
  let metrics = $derived(calculateKPIs(aggregated))

  // Données temporelles
  let timeSeriesData = $derived(groupByPeriod(filteredInterventions, 'month', currentFilters.dateRange))

  // Répartition des composants
  let componentData = $derived(calculateComponentRatios(aggregated))

  // Données avec taux de marge
  let timeSeriesWithMarginRate = $derived(calculateMarginRates(timeSeriesData))

  // Comparaison période précédente
  let comparison = $derived(() => {
    // Calculer les données de la période précédente selon le filtre actuel
    const prevFilters = { ...currentFilters }
    // Pour simplifier, on compare avec les mêmes données (à améliorer)
    const prevAggregated = aggregated
    return calculatePeriodComparison(aggregated, prevAggregated)
  })

  // Top clients
  let topClients = $derived(
    getTopItems(filteredInterventions, 'client', 5).map(item => ({
      ...item,
      name: formatClientName(clientsMap.get(item.id))
    }))
  )

  // Top véhicules
  let topVehicles = $derived(
    getTopItems(filteredInterventions, 'vehicle', 5).map(item => ({
      ...item,
      name: formatVehiculeName(vehiculesMap.get(item.id))
    }))
  )

  function formatClientName(client) {
    if (!client) return 'Client inconnu'
    return `${client.nom} ${client.prenom || ''}`.trim()
  }

  function formatVehiculeName(vehicule) {
    if (!vehicule) return 'Véhicule inconnu'
    return `${vehicule.marque} ${vehicule.modele || ''} (${vehicule.immatriculation})`.trim()
  }

  function handleFilterChange(filters) {
    currentFilters = filters
  }

  onMount(async () => {
    try {
      const [interventions, clients, vehicules] = await Promise.all([
        getAllInterventions(),
        getAllClients(),
        getAllVehicules()
      ])
      allInterventions = interventions
      allClients = clients
      allVehicules = vehicules
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      isLoading = false
    }
  })
</script>

<div class="page">
  <Header title="Comptabilité" />

  <main class="main-content">
    {#if isLoading}
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    {:else}
      <FilterBar
        clients={allClients}
        vehicules={allVehicules}
        onFilterChange={handleFilterChange}
      />

      <div class="tabs">
        {#each tabs as tab}
          <button
            class="tab-btn"
            class:active={activeTab === tab.id}
            onclick={() => activeTab = tab.id}
          >
            {tab.label}
          </button>
        {/each}
      </div>

      <div class="tab-content">
        {#if activeTab === 'overview'}
          <OverviewTab
            {metrics}
            {timeSeriesData}
            {componentData}
          />
        {:else if activeTab === 'breakdown'}
          <BreakdownTab {componentData} />
        {:else if activeTab === 'trends'}
          <TrendsTab
            timeSeriesData={timeSeriesWithMarginRate}
            comparison={comparison()}
            {topClients}
            {topVehicles}
          />
        {:else if activeTab === 'details'}
          <DetailsTab
            interventions={filteredInterventions}
            clients={clientsMap}
            vehicules={vehiculesMap}
          />
        {/if}
      </div>

      {#if filteredInterventions.length === 0}
        <div class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <p class="empty-title">Aucune donnée</p>
          <p class="empty-description">Aucune intervention ne correspond aux filtres sélectionnés.</p>
        </div>
      {/if}
    {/if}
  </main>
</div>

<style>
  .page {
    min-height: 100vh;
    background: var(--bg-primary);
  }

  .main-content {
    padding: 1rem;
    padding-bottom: 5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 1rem;
    gap: 1rem;
    color: var(--text-secondary);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    padding: 0.25rem;
    background: var(--bg-card);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-btn {
    flex: 1;
    min-width: fit-content;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .tab-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  .tab-btn.active {
    background: var(--primary-color);
    color: white;
  }

  .tab-content {
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    background: var(--bg-card);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    margin-bottom: 1rem;
  }

  .empty-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
  }

  .empty-description {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    margin: 0;
  }

  @media (min-width: 768px) {
    .main-content {
      padding-left: calc(88px + 1.5rem);
      padding-right: 1.5rem;
    }

    .tabs {
      gap: 0.75rem;
    }

    .tab-btn {
      padding: 0.875rem 1.5rem;
      font-size: 0.9375rem;
    }
  }
</style>
