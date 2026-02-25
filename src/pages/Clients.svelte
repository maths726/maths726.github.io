<script>
  import { onMount } from 'svelte'
  import Header from '../components/common/Header.svelte'
  import SearchBar from '../components/common/SearchBar.svelte'
  import Modal from '../components/common/Modal.svelte'
  import ClientList from '../components/clients/ClientList.svelte'
  import ClientForm from '../components/clients/ClientForm.svelte'
  import { clients } from '../lib/stores/clients.js'
  import { vehicules } from '../lib/stores/vehicules.js'
  import { showToast } from '../lib/stores/ui.js'
  import { getAllVehicules } from '../lib/db/vehicules.js'

  let { navigate } = $props()

  let searchQuery = $state('')
  let showAddModal = $state(false)
  let vehiculeCounts = $state({})

  onMount(async () => {
    await clients.load()
    const allVehicules = await getAllVehicules()
    vehiculeCounts = allVehicules.reduce((acc, v) => {
      acc[v.clientId] = (acc[v.clientId] || 0) + 1
      return acc
    }, {})
  })

  async function handleSearch(query) {
    searchQuery = query
    await clients.search(query)
  }

  function handleClientClick(client) {
    navigate(`/clients/${client.id}`)
  }

  async function handleAddClient(data) {
    try {
      await clients.add(data)
      showAddModal = false
      showToast('Client ajouté avec succès', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }
</script>

<div class="page">
  <Header title="Clients" />

  <main class="main-content">
    <div class="toolbar">
      <SearchBar
        value={searchQuery}
        placeholder="Rechercher un client..."
        onSearch={handleSearch}
      />
      <button class="add-btn" onclick={() => showAddModal = true}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span class="btn-text">Ajouter</span>
      </button>
    </div>

    <ClientList
      clients={$clients}
      {vehiculeCounts}
      onClientClick={handleClientClick}
      onAddClick={() => showAddModal = true}
    />
  </main>

  <Modal isOpen={showAddModal} title="Nouveau client" onClose={() => showAddModal = false}>
    <ClientForm
      onSubmit={handleAddClient}
      onCancel={() => showAddModal = false}
    />
  </Modal>
</div>

<style>
  .page {
    min-height: 100vh;
    background: var(--bg-primary);
  }

  .main-content {
    padding-bottom: 6rem;
  }

  .toolbar {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.2s;
  }

  .add-btn:hover {
    background: var(--primary-dark);
  }

  @media (max-width: 480px) {
    .btn-text {
      display: none;
    }

    .add-btn {
      padding: 0.625rem;
    }
  }

  @media (min-width: 768px) {
    .main-content {
      padding-left: 80px;
    }
  }
</style>
