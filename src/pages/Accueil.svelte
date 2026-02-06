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

  function showEnAttenteOnly() {
    enAttenteExpanded = true
    enCoursExpanded = false
  }

  function showEnCoursOnly() {
    enAttenteExpanded = false
    enCoursExpanded = true
  }

  function showAll() {
    enAttenteExpanded = true
    enCoursExpanded = true
  }
</script>

<div class="page">
  <Header title="Tableau de bord" />

  <main class="main-content">
    {#if loading}
      <div class="loading">
        <div class="loading-spinner"></div>
        <span>Chargement...</span>
      </div>
    {:else}
      <!-- Stats summary -->
      <div class="stats-bar">
        <button class="stat-item" class:active={enAttenteExpanded && !enCoursExpanded} onclick={showEnAttenteOnly}>
          <span class="stat-number">{interventionsEnAttente.length}</span>
          <span class="stat-label">En attente</span>
        </button>
        <div class="stat-divider"></div>
        <button class="stat-item" class:active={!enAttenteExpanded && enCoursExpanded} onclick={showEnCoursOnly}>
          <span class="stat-number">{interventionsEnCours.length}</span>
          <span class="stat-label">En cours</span>
        </button>
        <div class="stat-divider"></div>
        <button class="stat-item" class:active={enAttenteExpanded && enCoursExpanded} onclick={showAll}>
          <span class="stat-number">{interventionsEnAttente.length + interventionsEnCours.length}</span>
          <span class="stat-label">Total actif</span>
        </button>
      </div>

      <!-- En attente section -->
      <section class="interventions-section">
        <button class="section-header" onclick={() => enAttenteExpanded = !enAttenteExpanded}>
          <div class="section-header-left">
            <div class="section-icon waiting">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="section-title-group">
              <h2 class="section-title">En attente</h2>
              <span class="section-subtitle">{interventionsEnAttente.length} intervention{interventionsEnAttente.length > 1 ? 's' : ''}</span>
            </div>
          </div>
          <svg class="chevron" class:expanded={enAttenteExpanded} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {#if enAttenteExpanded}
          {#if interventionsEnAttente.length === 0}
            <div class="empty-state">
              <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <p>Aucune intervention en attente</p>
            </div>
          {:else}
            <div class="interventions-list">
              {#each interventionsEnAttente as intervention (intervention.id)}
                {@const info = getVehiculeInfo(intervention.vehiculeId)}
                <button class="intervention-card" onclick={() => handleInterventionClick(intervention)}>
                  <div class="card-left">
                    <div class="type-indicator type-{intervention.type}"></div>
                  </div>
                  <div class="card-content">
                    <div class="card-header">
                      <span class="type-badge type-{intervention.type}">{getTypeLabel(intervention.type)}</span>
                      <span class="date">{formatDate(intervention.date)}</span>
                    </div>
                    <p class="description">{intervention.description}</p>
                    {#if info.vehicule}
                      <div class="vehicule-row">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
                          <circle cx="6.5" cy="16.5" r="2.5"/>
                          <circle cx="16.5" cy="16.5" r="2.5"/>
                        </svg>
                        <span class="vehicule">{info.vehicule.marque} {info.vehicule.modele}</span>
                        <span class="immat">{info.vehicule.immatriculation}</span>
                      </div>
                    {/if}
                    {#if info.client}
                      <div class="client-row">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>{info.client.prenom} {info.client.nom}</span>
                      </div>
                    {/if}
                  </div>
                  <div class="card-right">
                    {#if intervention.cout}
                      <div class="cout">{formatPrice(intervention.cout)}</div>
                    {/if}
                    <svg class="card-chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        {/if}
      </section>

      <!-- En cours section -->
      <section class="interventions-section">
        <button class="section-header ongoing" onclick={() => enCoursExpanded = !enCoursExpanded}>
          <div class="section-header-left">
            <div class="section-icon ongoing">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div class="section-title-group">
              <h2 class="section-title">En cours</h2>
              <span class="section-subtitle">{interventionsEnCours.length} intervention{interventionsEnCours.length > 1 ? 's' : ''}</span>
            </div>
          </div>
          <svg class="chevron" class:expanded={enCoursExpanded} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {#if enCoursExpanded}
          {#if interventionsEnCours.length === 0}
            <div class="empty-state">
              <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <p>Aucune intervention en cours</p>
            </div>
          {:else}
            <div class="interventions-list">
              {#each interventionsEnCours as intervention (intervention.id)}
                {@const info = getVehiculeInfo(intervention.vehiculeId)}
                <button class="intervention-card" onclick={() => handleInterventionClick(intervention)}>
                  <div class="card-left">
                    <div class="type-indicator type-{intervention.type}"></div>
                  </div>
                  <div class="card-content">
                    <div class="card-header">
                      <span class="type-badge type-{intervention.type}">{getTypeLabel(intervention.type)}</span>
                      <span class="date">{formatDate(intervention.date)}</span>
                    </div>
                    <p class="description">{intervention.description}</p>
                    {#if info.vehicule}
                      <div class="vehicule-row">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
                          <circle cx="6.5" cy="16.5" r="2.5"/>
                          <circle cx="16.5" cy="16.5" r="2.5"/>
                        </svg>
                        <span class="vehicule">{info.vehicule.marque} {info.vehicule.modele}</span>
                        <span class="immat">{info.vehicule.immatriculation}</span>
                      </div>
                    {/if}
                    {#if info.client}
                      <div class="client-row">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>{info.client.prenom} {info.client.nom}</span>
                      </div>
                    {/if}
                  </div>
                  <div class="card-right">
                    {#if intervention.cout}
                      <div class="cout">{formatPrice(intervention.cout)}</div>
                    {/if}
                    <svg class="card-chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
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
    padding: 1.5rem 1rem;
    padding-bottom: 6rem;
    max-width: 900px;
    margin: 0 auto;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 4rem 2rem;
    color: var(--text-secondary);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Stats bar */
  .stats-bar {
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: white;
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-md);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    background: transparent;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .stat-item:hover {
    background: var(--bg-primary);
  }

  .stat-item.active {
    background: var(--primary-lighter);
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    line-height: 1;
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background: var(--border-color);
  }

  /* Section styles */
  .interventions-section {
    margin-bottom: 1.5rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem 1.25rem;
    background: white;
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    margin-bottom: 1rem;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal);
  }

  .section-header:hover {
    box-shadow: var(--shadow-md);
  }

  .section-header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .section-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .section-icon.waiting {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    color: #6b7280;
  }

  .section-icon.ongoing {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #b45309;
  }

  .section-title-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .section-subtitle {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .chevron {
    color: var(--text-muted);
    transition: transform var(--transition-normal);
  }

  .chevron.expanded {
    transform: rotate(180deg);
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2.5rem;
    background: white;
    border-radius: var(--radius-lg);
    border: 2px dashed var(--border-color);
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    background: var(--bg-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-green);
  }

  .empty-state p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9375rem;
  }

  /* Intervention cards */
  .interventions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .intervention-card {
    display: flex;
    align-items: stretch;
    background: white;
    border: none;
    border-radius: var(--radius-lg);
    overflow: hidden;
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-sm);
    width: 100%;
  }

  .intervention-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  .card-left {
    width: 6px;
    flex-shrink: 0;
  }

  .type-indicator {
    width: 100%;
    height: 100%;
  }

  .type-indicator.type-entretien {
    background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  }

  .type-indicator.type-reparation {
    background: linear-gradient(180deg, #f59e0b 0%, #b45309 100%);
  }

  .card-content {
    flex: 1;
    padding: 1rem 1.25rem;
    min-width: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .type-badge {
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 0.375rem 0.625rem;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .type-badge.type-entretien {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .type-badge.type-reparation {
    background: #fef3c7;
    color: #b45309;
  }

  .date {
    font-size: 0.8125rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .description {
    font-size: 0.9375rem;
    color: var(--text-primary);
    margin: 0 0 0.75rem;
    line-height: 1.5;
    font-weight: 500;
  }

  .vehicule-row,
  .client-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin-bottom: 0.375rem;
  }

  .vehicule-row svg,
  .client-row svg {
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .vehicule {
    font-weight: 500;
  }

  .immat {
    font-size: 0.75rem;
    color: var(--primary-color);
    font-weight: 700;
    letter-spacing: 0.05em;
    background: var(--primary-lighter);
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
  }

  .card-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    padding: 1rem;
    padding-left: 0;
    gap: 0.5rem;
  }

  .cout {
    font-size: 1rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  .card-chevron {
    color: var(--text-muted);
  }

  @media (min-width: 768px) {
    .main-content {
      padding-left: 108px;
    }
  }
</style>
