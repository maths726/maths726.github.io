<script>
  import { onMount } from 'svelte'
  import Header from '../components/common/Header.svelte'
  import { exportAndDownload, exportAllData } from '../lib/utils/export.js'
  import { showToast } from '../lib/stores/ui.js'

  let stats = $state({
    clients: 0,
    vehicules: 0,
    interventions: 0
  })

  let isExporting = $state(false)

  onMount(async () => {
    const data = await exportAllData()
    stats = data.stats
  })

  async function handleExport() {
    isExporting = true
    try {
      await exportAndDownload()
      showToast('Données exportées avec succès', 'success')
    } catch (error) {
      showToast('Erreur lors de l\'export', 'error')
    } finally {
      isExporting = false
    }
  }
</script>

<div class="page">
  <Header title="Paramètres" />

  <main class="main-content">
    <section class="settings-section">
      <h2 class="section-title">Export des données</h2>
      <div class="card">
        <p class="card-description">
          Exportez toutes vos données au format JSON pour les sauvegarder ou les transférer.
        </p>

        <div class="stats-summary">
          <div class="stat">
            <span class="stat-value">{stats.clients}</span>
            <span class="stat-label">clients</span>
          </div>
          <div class="stat">
            <span class="stat-value">{stats.vehicules}</span>
            <span class="stat-label">véhicules</span>
          </div>
          <div class="stat">
            <span class="stat-value">{stats.interventions}</span>
            <span class="stat-label">interventions</span>
          </div>
        </div>

        <button class="export-btn" onclick={handleExport} disabled={isExporting}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {isExporting ? 'Export en cours...' : 'Exporter les données'}
        </button>
      </div>
    </section>

    <section class="settings-section">
      <h2 class="section-title">À propos</h2>
      <div class="card">
        <div class="about-content">
          <h3 class="app-name">Suivi Client</h3>
          <p class="app-version">Version 1.0.0</p>
          <p class="app-description">
            Application de suivi client pour mécanicien.
            Gérez vos clients, leurs véhicules et l'historique des interventions.
          </p>
          <div class="app-features">
            <div class="feature">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Fonctionne hors ligne
            </div>
            <div class="feature">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Données stockées localement
            </div>
            <div class="feature">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Export JSON
            </div>
          </div>
        </div>
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
    max-width: 600px;
    margin: 0 auto;
  }

  .settings-section {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.75rem;
    padding-left: 0.25rem;
  }

  .card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.25rem;
  }

  .card-description {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    margin: 0 0 1.25rem;
    line-height: 1.5;
  }

  .stats-summary {
    display: flex;
    justify-content: space-around;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    margin-bottom: 1.25rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .export-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.875rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s, opacity 0.2s;
  }

  .export-btn:hover:not(:disabled) {
    background: var(--primary-dark);
  }

  .export-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .about-content {
    text-align: center;
  }

  .app-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.25rem;
  }

  .app-version {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0 0 1rem;
  }

  .app-description {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    margin: 0 0 1.25rem;
    line-height: 1.5;
  }

  .app-features {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-primary);
  }

  .feature svg {
    color: #22c55e;
  }

  @media (min-width: 768px) {
    .main-content {
      padding-left: calc(80px + 1rem);
    }
  }
</style>
