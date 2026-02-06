<script>
  import { onMount } from 'svelte'
  import Header from '../components/common/Header.svelte'
  import Modal from '../components/common/Modal.svelte'
  import VehiculeList from '../components/vehicules/VehiculeList.svelte'
  import VehiculeForm from '../components/vehicules/VehiculeForm.svelte'
  import ClientForm from '../components/clients/ClientForm.svelte'
  import { getClient, deleteClient } from '../lib/db/clients.js'
  import { clients } from '../lib/stores/clients.js'
  import { vehicules } from '../lib/stores/vehicules.js'
  import { interventions } from '../lib/stores/interventions.js'
  import { showToast } from '../lib/stores/ui.js'
  import { formatTelephone, formatDateLong } from '../lib/utils/format.js'
  import { deleteVehiculesByClientId, getVehiculesByClientId } from '../lib/db/vehicules.js'
  import { getAllInterventions, deleteInterventionsByVehiculeId } from '../lib/db/interventions.js'

  let { clientId, navigate } = $props()

  let client = $state(null)
  let showEditModal = $state(false)
  let showAddVehiculeModal = $state(false)
  let showDeleteConfirm = $state(false)
  let interventionCounts = $state({})

  onMount(async () => {
    client = await getClient(clientId)
    if (!client) {
      navigate('/clients')
      return
    }
    await vehicules.loadByClient(clientId)

    const allInterventions = await getAllInterventions()
    interventionCounts = allInterventions.reduce((acc, i) => {
      acc[i.vehiculeId] = (acc[i.vehiculeId] || 0) + 1
      return acc
    }, {})
  })

  function handleBack() {
    navigate('/clients')
  }

  function handleVehiculeClick(vehicule) {
    navigate(`/vehicules/${vehicule.id}`)
  }

  async function handleUpdateClient(data) {
    try {
      client = await clients.update(clientId, data)
      showEditModal = false
      showToast('Client modifié avec succès', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  async function handleAddVehicule(data) {
    try {
      await vehicules.add({ ...data, clientId })
      showAddVehiculeModal = false
      showToast('Véhicule ajouté avec succès', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  async function handleDeleteClient() {
    try {
      // Supprimer les interventions des véhicules du client
      const clientVehicules = await getVehiculesByClientId(clientId)
      for (const v of clientVehicules) {
        await deleteInterventionsByVehiculeId(v.id)
      }
      // Supprimer les véhicules
      await deleteVehiculesByClientId(clientId)
      // Supprimer le client
      await deleteClient(clientId)
      await clients.load()
      showToast('Client supprimé', 'success')
      navigate('/clients')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }
</script>

<div class="page">
  <Header title={client ? `${client.prenom} ${client.nom}` : 'Client'} showBack={true} onBack={handleBack} />

  {#if client}
    <main class="main-content">
      <section class="client-info">
        <div class="info-header">
          <div class="avatar">
            {client.prenom?.[0] || ''}{client.nom?.[0] || '?'}
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

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Téléphone</span>
            <a href="tel:{client.telephone}" class="info-value link">{formatTelephone(client.telephone)}</a>
          </div>
          {#if client.email}
            <div class="info-item">
              <span class="info-label">Email</span>
              <a href="mailto:{client.email}" class="info-value link">{client.email}</a>
            </div>
          {/if}
          {#if client.adresse}
            <div class="info-item full">
              <span class="info-label">Adresse</span>
              <span class="info-value">{client.adresse}</span>
            </div>
          {/if}
          {#if client.notes}
            <div class="info-item full">
              <span class="info-label">Notes</span>
              <span class="info-value">{client.notes}</span>
            </div>
          {/if}
          <div class="info-item">
            <span class="info-label">Client depuis</span>
            <span class="info-value">{formatDateLong(client.createdAt)}</span>
          </div>
        </div>
      </section>

      <section class="vehicules-section">
        <div class="section-header">
          <h2 class="section-title">Véhicules</h2>
          <button class="add-btn-small" onclick={() => showAddVehiculeModal = true}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Ajouter
          </button>
        </div>

        <VehiculeList
          vehicules={$vehicules}
          {interventionCounts}
          onVehiculeClick={handleVehiculeClick}
          onAddClick={() => showAddVehiculeModal = true}
        />
      </section>
    </main>
  {/if}

  <Modal isOpen={showEditModal} title="Modifier le client" onClose={() => showEditModal = false}>
    <ClientForm
      {client}
      onSubmit={handleUpdateClient}
      onCancel={() => showEditModal = false}
    />
  </Modal>

  <Modal isOpen={showAddVehiculeModal} title="Nouveau véhicule" onClose={() => showAddVehiculeModal = false}>
    <VehiculeForm
      onSubmit={handleAddVehicule}
      onCancel={() => showAddVehiculeModal = false}
    />
  </Modal>

  <Modal isOpen={showDeleteConfirm} title="Supprimer le client" onClose={() => showDeleteConfirm = false}>
    <div class="delete-confirm">
      <p>Êtes-vous sûr de vouloir supprimer ce client ?</p>
      <p class="warning">Cette action supprimera également tous ses véhicules et leurs interventions.</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" onclick={() => showDeleteConfirm = false}>Annuler</button>
        <button class="btn btn-danger" onclick={handleDeleteClient}>Supprimer</button>
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

  .client-info {
    background: white;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .info-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .avatar {
    width: 64px;
    height: 64px;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.25rem;
    text-transform: uppercase;
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

  .info-value.link {
    color: var(--primary-color);
    text-decoration: none;
  }

  .info-value.link:hover {
    text-decoration: underline;
  }

  .vehicules-section {
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
