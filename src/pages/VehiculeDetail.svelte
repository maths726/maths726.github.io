<script>
  import { onMount } from 'svelte'
  import Header from '../components/common/Header.svelte'
  import Modal from '../components/common/Modal.svelte'
  import InterventionList from '../components/interventions/InterventionList.svelte'
  import InterventionForm from '../components/interventions/InterventionForm.svelte'
  import VehiculeForm from '../components/vehicules/VehiculeForm.svelte'
  import { getVehicule, deleteVehicule } from '../lib/db/vehicules.js'
  import { getClient } from '../lib/db/clients.js'
  import { vehicules } from '../lib/stores/vehicules.js'
  import { interventions } from '../lib/stores/interventions.js'
  import { showToast } from '../lib/stores/ui.js'
  import { formatKilometrage, formatImmatriculation, formatDateLong, formatMiseEnCirculation } from '../lib/utils/format.js'
  import { deleteInterventionsByVehiculeId } from '../lib/db/interventions.js'

  let { vehiculeId, navigate } = $props()

  let vehicule = $state(null)
  let client = $state(null)
  let showEditModal = $state(false)
  let showAddInterventionModal = $state(false)
  let showEditInterventionModal = $state(false)
  let selectedIntervention = $state(null)
  let showDeleteConfirm = $state(false)
  let fromVehicules = $state(false)

  let lastKilometrage = $derived(
    $interventions
      .filter(i => i.kilometrage > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.kilometrage || 0
  )

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search)
    fromVehicules = urlParams.get('from') === 'vehicules'

    vehicule = await getVehicule(vehiculeId)
    if (!vehicule) {
      navigate(fromVehicules ? '/vehicules' : '/clients')
      return
    }
    client = await getClient(vehicule.clientId)
    await interventions.loadByVehicule(vehiculeId)
  })

  function handleBack() {
    if (fromVehicules) {
      navigate('/vehicules')
    } else if (client) {
      navigate(`/clients/${client.id}`)
    } else {
      navigate('/clients')
    }
  }

  async function handleUpdateVehicule(data) {
    try {
      vehicule = await vehicules.update(vehiculeId, data)
      showEditModal = false
      showToast('Véhicule modifié avec succès', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  async function handleAddIntervention(data) {
    try {
      await interventions.add({ ...data, vehiculeId })
      showAddInterventionModal = false
      showToast('Intervention ajoutée avec succès', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  function handleInterventionClick(intervention) {
    selectedIntervention = intervention
    showEditInterventionModal = true
  }

  async function handleUpdateIntervention(data) {
    try {
      await interventions.update(selectedIntervention.id, data)
      showEditInterventionModal = false
      selectedIntervention = null
      showToast('Intervention modifiée avec succès', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  async function handleDeleteVehicule() {
    try {
      await deleteInterventionsByVehiculeId(vehiculeId)
      await deleteVehicule(vehiculeId)
      showToast('Véhicule supprimé', 'success')
      handleBack()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }
</script>

<div class="page">
  <Header
    title={vehicule ? `${vehicule.marque} ${vehicule.modele}` : 'Véhicule'}
    showBack={true}
    onBack={handleBack}
  />

  {#if vehicule}
    <main class="main-content">
      <section class="vehicule-info">
        <div class="info-header">
          <div class="vehicule-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
              <circle cx="6.5" cy="16.5" r="2.5"/>
              <circle cx="16.5" cy="16.5" r="2.5"/>
            </svg>
          </div>
          <div class="info-actions">
            <button class="action-btn" onclick={() => showEditModal = true}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn danger" onclick={() => showDeleteConfirm = true}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="immat-badge">
          {formatImmatriculation(vehicule.immatriculation)}
        </div>

        {#if client}
          <button class="client-link" onclick={() => navigate(`/clients/${client.id}`)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {client.prenom} {client.nom}
          </button>
        {/if}

        <div class="info-grid">
          {#if vehicule.anneeMiseEnCirculation}
            <div class="info-item">
              <span class="info-label">Mise en circulation</span>
              <span class="info-value">{formatMiseEnCirculation(vehicule.moisMiseEnCirculation, vehicule.anneeMiseEnCirculation)}</span>
            </div>
          {/if}
          {#if lastKilometrage}
            <div class="info-item">
              <span class="info-label">Kilométrage</span>
              <span class="info-value">{formatKilometrage(lastKilometrage)}</span>
            </div>
          {/if}
          {#if vehicule.vin}
            <div class="info-item full">
              <span class="info-label">VIN</span>
              <span class="info-value mono">{vehicule.vin}</span>
            </div>
          {/if}
          {#if vehicule.notes}
            <div class="info-item full">
              <span class="info-label">Notes</span>
              <span class="info-value">{vehicule.notes}</span>
            </div>
          {/if}
          <div class="info-item">
            <span class="info-label">Ajouté le</span>
            <span class="info-value">{formatDateLong(vehicule.createdAt)}</span>
          </div>
        </div>
      </section>

      <section class="interventions-section">
        <div class="section-header">
          <h2 class="section-title">Interventions</h2>
          <button class="add-btn-small" onclick={() => showAddInterventionModal = true}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Ajouter
          </button>
        </div>

        <InterventionList
          interventions={$interventions}
          onInterventionClick={handleInterventionClick}
          onAddClick={() => showAddInterventionModal = true}
        />
      </section>
    </main>
  {/if}

  <Modal isOpen={showEditModal} title="Modifier le véhicule" onClose={() => showEditModal = false}>
    <VehiculeForm
      {vehicule}
      onSubmit={handleUpdateVehicule}
      onCancel={() => showEditModal = false}
    />
  </Modal>

  <Modal isOpen={showAddInterventionModal} title="Nouvelle intervention" onClose={() => showAddInterventionModal = false}>
    <InterventionForm
      onSubmit={handleAddIntervention}
      onCancel={() => showAddInterventionModal = false}
    />
  </Modal>

  <Modal isOpen={showEditInterventionModal} title="Modifier l'intervention" onClose={() => { showEditInterventionModal = false; selectedIntervention = null }}>
    {#if selectedIntervention}
      <InterventionForm
        intervention={selectedIntervention}
        onSubmit={handleUpdateIntervention}
        onCancel={() => { showEditInterventionModal = false; selectedIntervention = null }}
      />
    {/if}
  </Modal>

  <Modal isOpen={showDeleteConfirm} title="Supprimer le véhicule" onClose={() => showDeleteConfirm = false}>
    <div class="delete-confirm">
      <p>Êtes-vous sûr de vouloir supprimer ce véhicule ?</p>
      <p class="warning">Cette action supprimera également toutes ses interventions.</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" onclick={() => showDeleteConfirm = false}>Annuler</button>
        <button class="btn btn-danger" onclick={handleDeleteVehicule}>Supprimer</button>
      </div>
    </div>
  </Modal>
</div>

<style>
  .page {
    min-height: 100vh;
    background: var(--bg-primary);
  }

  .main-content {
    padding-bottom: 5rem;
  }

  .vehicule-info {
    background: var(--bg-card);
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .info-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .vehicule-icon {
    width: 64px;
    height: 64px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .info-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border: none;
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
  }

  .action-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .action-btn.danger:hover {
    background: #fee2e2;
    color: #dc2626;
  }

  .immat-badge {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 700;
    font-size: 1.125rem;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
  }

  .client-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: var(--bg-secondary);
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    color: var(--text-primary);
    cursor: pointer;
    margin-bottom: 1.5rem;
    transition: background-color 0.2s;
  }

  .client-link:hover {
    background: var(--bg-hover);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-item.full {
    grid-column: 1 / -1;
  }

  .info-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-value {
    font-size: 0.9375rem;
    color: var(--text-primary);
  }

  .info-value.mono {
    font-family: monospace;
    letter-spacing: 0.025em;
  }

  .interventions-section {
    padding: 1rem 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    margin-bottom: 0.5rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .add-btn-small {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .add-btn-small:hover {
    background: var(--primary-dark);
  }

  .delete-confirm {
    text-align: center;
  }

  .delete-confirm p {
    margin: 0 0 1rem;
    color: var(--text-primary);
  }

  .delete-confirm .warning {
    color: #dc2626;
    font-size: 0.875rem;
  }

  .confirm-actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s;
  }

  .btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .btn-secondary:hover {
    background: var(--bg-hover);
  }

  .btn-danger {
    background: #dc2626;
    color: white;
  }

  .btn-danger:hover {
    background: #b91c1c;
  }

  @media (min-width: 768px) {
    .main-content {
      padding-left: 80px;
    }
  }

  @media (max-width: 480px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
