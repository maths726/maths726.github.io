<script>
  import { onMount } from 'svelte'

  let {
    onFilterChange,
    clients = [],
    vehicules = []
  } = $props()

  // État des filtres
  let filters = $state({
    dateRange: '3months',
    clientId: '',
    vehiculeId: ''
  })

  // Options pour la période
  const dateRangeOptions = [
    { value: 'month', label: 'Ce mois' },
    { value: '3months', label: '3 derniers mois' },
    { value: '6months', label: '6 derniers mois' },
    { value: 'year', label: 'Cette année' },
    { value: 'all', label: 'Tout' }
  ]

  // Calculer les véhicules filtrés selon le client sélectionné
  let vehiculesFiltered = $derived.by(() => {
    if (!filters.clientId) {
      return vehicules
    }
    return vehicules.filter(v => v.clientId === filters.clientId)
  })

  // Formater le nom du client
  function formatClientName(client) {
    return `${client.nom} ${client.prenom}`.trim()
  }

  // Formater le nom du véhicule
  function formatVehicule(vehicule) {
    const marqueModele = `${vehicule.marque} ${vehicule.modele}`.trim()
    return `${marqueModele} (${vehicule.immatriculation})`
  }

  // Gérer le changement de période
  function handleDateRangeChange(e) {
    filters.dateRange = e.target.value
    onFilterChange?.(filters)
  }

  // Gérer le changement de client
  function handleClientChange(e) {
    filters.clientId = e.target.value
    // Réinitialiser le véhicule quand le client change
    filters.vehiculeId = ''
    onFilterChange?.(filters)
  }

  // Gérer le changement de véhicule
  function handleVehiculeChange(e) {
    filters.vehiculeId = e.target.value
    onFilterChange?.(filters)
  }

  // Déclencher le filtre initial au montage
  onMount(() => {
    onFilterChange?.(filters)
  })
</script>

<div class="filter-bar">
  <div class="filter-container">
    <div class="filter-group">
      <label for="date-range" class="filter-label">Période</label>
      <select
        id="date-range"
        class="filter-select"
        value={filters.dateRange}
        onchange={handleDateRangeChange}
      >
        {#each dateRangeOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>

    <div class="filter-group">
      <label for="client" class="filter-label">Client</label>
      <select
        id="client"
        class="filter-select"
        value={filters.clientId}
        onchange={handleClientChange}
      >
        <option value="">Tous les clients</option>
        {#each clients as client}
          <option value={client.id}>{formatClientName(client)}</option>
        {/each}
      </select>
    </div>

    <div class="filter-group">
      <label for="vehicule" class="filter-label">Véhicule</label>
      <select
        id="vehicule"
        class="filter-select"
        value={filters.vehiculeId}
        onchange={handleVehiculeChange}
        disabled={!filters.clientId && vehiculesFiltered.length === vehicules.length}
      >
        <option value="">Tous les véhicules</option>
        {#each vehiculesFiltered as vehicule}
          <option value={vehicule.id}>{formatVehicule(vehicule)}</option>
        {/each}
      </select>
    </div>
  </div>
</div>

<style>
  .filter-bar {
    padding: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }

  .filter-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .filter-select {
    width: 100%;
    box-sizing: border-box;
    padding: 0.875rem 1rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.9375rem;
    color: var(--text-primary);
    background: var(--bg-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.75rem center;
    background-repeat: no-repeat;
    background-size: 1.25em 1.25em;
    padding-right: 2.5rem;
  }

  .filter-select:hover {
    border-color: var(--text-muted);
  }

  .filter-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 102, 177, 0.1);
  }

  .filter-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--bg-primary);
  }

  @media (max-width: 768px) {
    .filter-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .filter-container {
      grid-template-columns: 1fr;
    }
  }
</style>
