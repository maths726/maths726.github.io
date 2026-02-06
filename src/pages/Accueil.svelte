<script>
  import { onMount } from 'svelte'
  import Header from '../components/common/Header.svelte'
  import { clients } from '../lib/stores/clients.js'
  import { vehicules } from '../lib/stores/vehicules.js'
  import { interventions } from '../lib/stores/interventions.js'

  let { navigate } = $props()

  let stats = $state({
    clients: 0,
    vehicules: 0,
    interventions: 0,
    interventionsEnCours: 0
  })

  let recentInterventions = $state([])

  onMount(async () => {
    const [clientList, vehiculeList, interventionList] = await Promise.all([
      clients.load(),
      vehicules.load(),
      interventions.load()
    ])

    stats = {
      clients: clientList.length,
      vehicules: vehiculeList.length,
      interventions: interventionList.length,
      interventionsEnCours: interventionList.filter(i => i.statut === 'en_cours').length
    }

    recentInterventions = interventionList.slice(0, 5)
  })
</script>

<div class="page">
  <Header title="Suivi Client" />

  <main class="main-content">
    <section class="stats-grid">
      <button class="stat-card" onclick={() => navigate('/clients')}>
        <div class="stat-icon clients">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{stats.clients}</span>
          <span class="stat-label">Clients</span>
        </div>
      </button>

      <button class="stat-card" onclick={() => navigate('/clients')}>
        <div class="stat-icon vehicules">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
            <circle cx="6.5" cy="16.5" r="2.5"/>
            <circle cx="16.5" cy="16.5" r="2.5"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{stats.vehicules}</span>
          <span class="stat-label">Véhicules</span>
        </div>
      </button>

      <button class="stat-card" onclick={() => navigate('/clients')}>
        <div class="stat-icon interventions">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{stats.interventions}</span>
          <span class="stat-label">Interventions</span>
        </div>
      </button>

      <div class="stat-card highlight">
        <div class="stat-icon en-cours">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{stats.interventionsEnCours}</span>
          <span class="stat-label">En cours</span>
        </div>
      </div>
    </section>

    <section class="quick-actions">
      <h2 class="section-title">Actions rapides</h2>
      <div class="actions-grid">
        <button class="action-btn" onclick={() => navigate('/clients')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Nouveau client
        </button>
        <button class="action-btn" onclick={() => navigate('/parametres')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exporter données
        </button>
      </div>
    </section>
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
    max-width: 800px;
    margin: 0 auto;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    text-align: left;
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .stat-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-color: var(--primary-color);
  }

  .stat-card.highlight {
    background: linear-gradient(135deg, var(--primary-color), #ff6b3d);
    border: none;
    color: white;
    cursor: default;
  }

  .stat-card.highlight:hover {
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon.clients {
    background: #dbeafe;
    color: #2563eb;
  }

  .stat-icon.vehicules {
    background: #d1fae5;
    color: #059669;
  }

  .stat-icon.interventions {
    background: #fef3c7;
    color: #d97706;
  }

  .stat-icon.en-cours {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 0.8125rem;
    opacity: 0.8;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 1rem;
  }

  .quick-actions {
    margin-bottom: 2rem;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .action-btn:hover {
    background: var(--bg-hover);
    border-color: var(--primary-color);
  }

  @media (min-width: 768px) {
    .main-content {
      padding-left: 100px;
    }

    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
