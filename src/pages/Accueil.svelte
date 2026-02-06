<script>
  import { onMount } from 'svelte'
  import Header from '../components/common/Header.svelte'
  import Modal from '../components/common/Modal.svelte'
  import InterventionForm from '../components/interventions/InterventionForm.svelte'
  import { getAllInterventions } from '../lib/db/interventions.js'
  import { getAllVehicules } from '../lib/db/vehicules.js'
  import { getAllClients } from '../lib/db/clients.js'
  import { formatDate, formatPrice } from '../lib/utils/format.js'
  import { TYPES_INTERVENTION, STATUTS_INTERVENTION } from '../lib/db/interventions.js'
  import { interventions as interventionsStore } from '../lib/stores/interventions.js'
  import { showToast } from '../lib/stores/ui.js'

  let { navigate } = $props()

  let interventionsEnAttente = $state([])
  let interventionsEnCours = $state([])
  let vehiculesMap = $state({})
  let clientsMap = $state({})
  let loading = $state(true)
  let enAttenteExpanded = $state(true)
  let enCoursExpanded = $state(true)
  let showEditModal = $state(false)
  let selectedIntervention = $state(null)

  onMount(async () => {
    await loadData()
  })

  async function loadData() {
    const [interventions, vehicules, clients] = await Promise.all([
      getAllInterventions(),
      getAllVehicules(),
      getAllClients()
    ])

    vehiculesMap = vehicules.reduce((acc, v) => {
      acc[v.id] = v
      return acc
    }, {})

    clientsMap = clients.reduce((acc, c) => {
      acc[c.id] = c
      return acc
    }, {})

    interventionsEnAttente = interventions.filter(i => i.statut === 'en_attente')
    interventionsEnCours = interventions.filter(i => i.statut === 'en_cours')
    loading = false
  }

  function getVehiculeInfo(vehiculeId) {
    const vehicule = vehiculesMap[vehiculeId]
    if (!vehicule) return { vehicule: null, client: null }
    const client = clientsMap[vehicule.clientId]
    return { vehicule, client }
  }

  function getTypeLabel(type) {
    return TYPES_INTERVENTION.find(t => t.value === type)?.label || type
  }

  function handleInterventionClick(intervention) {
    selectedIntervention = intervention
    showEditModal = true
  }

  async function handleUpdateIntervention(data) {
    try {
      await interventionsStore.update(selectedIntervention.id, data)
      showEditModal = false
      selectedIntervention = null
      showToast('Intervention modifiee', 'success')
      await loadData()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  function closeModal() {
    showEditModal = false
    selectedIntervention = null
  }
</script>

<div class="page">
  <Header title="Suivi Client" />

  <main class="main-content">
    {#if loading}
      <div class="loading">Chargement...</div>
    {:else}
      <section class="interventions-section">
        <button class="section-header" onclick={() => enAttenteExpanded = !enAttenteExpanded}>
          <h2 class="section-title">
            En attente
            {#if interventionsEnAttente.length > 0}
              <span class="count">{interventionsEnAttente.length}</span>
            {/if}
          </h2>
          <svg class="chevron" class:expanded={enAttenteExpanded} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {#if enAttenteExpanded}
          {#if interventionsEnAttente.length === 0}
            <div class="empty-message">Aucune intervention en attente</div>
          {:else}
            <div class="interventions-list">
              {#each interventionsEnAttente as intervention (intervention.id)}
                {@const info = getVehiculeInfo(intervention.vehiculeId)}
                <button class="intervention-card" onclick={() => handleInterventionClick(intervention)}>
                  <div class="card-header">
                    <span class="type-badge type-{intervention.type}">{getTypeLabel(intervention.type)}</span>
                    <span class="date">{formatDate(intervention.date)}</span>
                  </div>
                  <p class="description">{intervention.description}</p>
                  {#if info.vehicule}
                    <div class="vehicule-info">
                      <span class="vehicule">{info.vehicule.marque} {info.vehicule.modele}</span>
                      <span class="immat">{info.vehicule.immatriculation}</span>
                    </div>
                  {/if}
                  {#if info.client}
                    <div class="client-info">{info.client.prenom} {info.client.nom}</div>
                  {/if}
                  {#if intervention.cout}
                    <div class="cout">{formatPrice(intervention.cout)}</div>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        {/if}
      </section>

      <section class="interventions-section">
        <button class="section-header" onclick={() => enCoursExpanded = !enCoursExpanded}>
          <h2 class="section-title">
            En cours
            {#if interventionsEnCours.length > 0}
              <span class="count">{interventionsEnCours.length}</span>
            {/if}
          </h2>
          <svg class="chevron" class:expanded={enCoursExpanded} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {#if enCoursExpanded}
          {#if interventionsEnCours.length === 0}
            <div class="empty-message">Aucune intervention en cours</div>
          {:else}
            <div class="interventions-list">
              {#each interventionsEnCours as intervention (intervention.id)}
                {@const info = getVehiculeInfo(intervention.vehiculeId)}
                <button class="intervention-card" onclick={() => handleInterventionClick(intervention)}>
                  <div class="card-header">
                    <span class="type-badge type-{intervention.type}">{getTypeLabel(intervention.type)}</span>
                    <span class="date">{formatDate(intervention.date)}</span>
                  </div>
                  <p class="description">{intervention.description}</p>
                  {#if info.vehicule}
                    <div class="vehicule-info">
                      <span class="vehicule">{info.vehicule.marque} {info.vehicule.modele}</span>
                      <span class="immat">{info.vehicule.immatriculation}</span>
                    </div>
                  {/if}
                  {#if info.client}
                    <div class="client-info">{info.client.prenom} {info.client.nom}</div>
                  {/if}
                  {#if intervention.cout}
                    <div class="cout">{formatPrice(intervention.cout)}</div>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        {/if}
      </section>
    {/if}
  </main>

  <Modal isOpen={showEditModal} title="Modifier l'intervention" onClose={closeModal}>
    {#if selectedIntervention}
      <InterventionForm
        intervention={selectedIntervention}
        onSubmit={handleUpdateIntervention}
        onCancel={closeModal}
      />
    {/if}
  </Modal>
</div>

<style>
  .page {
    min-height: 100vh;
    background: var(--bg-primary);
  }

  .main-content {
    padding: 1rem;
    padding-bottom: 5rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
  }

  .interventions-section {
    margin-bottom: 1.5rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.75rem 1rem;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 0.75rem;
    transition: background-color 0.2s;
  }

  .section-header:hover {
    background: var(--bg-hover);
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .chevron {
    color: var(--text-secondary);
    transition: transform 0.2s;
  }

  .chevron.expanded {
    transform: rotate(180deg);
  }

  .count {
    background: var(--primary-color);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.125rem 0.5rem;
    border-radius: 10px;
  }

  .empty-message {
    text-align: center;
    padding: 1.5rem;
    color: var(--text-secondary);
    background: white;
    border-radius: 12px;
    border: 1px solid var(--border-color);
  }

  .interventions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .intervention-card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    text-align: left;
    cursor: pointer;
    transition: box-shadow 0.2s, border-color 0.2s;
    width: 100%;
  }

  .intervention-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-color: var(--primary-color);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .type-badge {
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

  .date {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .description {
    font-size: 0.9375rem;
    color: var(--text-primary);
    margin: 0 0 0.75rem;
    line-height: 1.4;
  }

  .vehicule-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .vehicule {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .immat {
    font-size: 0.75rem;
    color: var(--primary-color);
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .client-info {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .cout {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--primary-color);
  }

  @media (min-width: 768px) {
    .main-content {
      padding-left: 100px;
    }
  }
</style>
