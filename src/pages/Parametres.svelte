<script>
  import Header from '../components/common/Header.svelte'
  import { exportAndDownload, importData, readJSONFile } from '../lib/utils/export.js'
  import { showToast, darkMode } from '../lib/stores/ui.js'

  let isExporting = $state(false)
  let isImporting = $state(false)
  let fileInput

  function toggleDarkMode() {
    darkMode.toggle()
  }

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

  function triggerImport() {
    fileInput.click()
  }

  async function handleImport(event) {
    const file = event.target.files?.[0]
    if (!file) return

    isImporting = true
    try {
      const jsonData = await readJSONFile(file)
      const result = await importData(jsonData)
      const total = result.clients + result.vehicules + result.interventions
      if (total > 0) {
        showToast(`${total} élément(s) importé(s)`, 'success')
      } else {
        showToast('Aucune nouvelle donnée à importer', 'info')
      }
    } catch (error) {
      showToast(error.message || 'Erreur lors de l\'import', 'error')
    } finally {
      isImporting = false
      event.target.value = ''
    }
  }
</script>

<div class="page">
  <Header title="Paramètres" />

  <main class="main-content">
    <section class="settings-section">
      <h2 class="section-title">Apparence</h2>
      <div class="card">
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-icon">
              {#if $darkMode}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              {/if}
            </div>
            <div class="setting-text">
              <span class="setting-label">Mode sombre</span>
              <span class="setting-description">Réduire la luminosité de l'écran</span>
            </div>
          </div>
          <button class="toggle-switch" class:active={$darkMode} onclick={toggleDarkMode} aria-label="Activer le mode sombre">
            <span class="toggle-knob"></span>
          </button>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <h2 class="section-title">Données</h2>
      <div class="card">
        <p class="card-description">
          Exportez ou importez vos données au format JSON.
        </p>

        <div class="data-buttons">
          <button class="data-btn export" onclick={handleExport} disabled={isExporting}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {isExporting ? 'Export...' : 'Exporter'}
          </button>
          <button class="data-btn import" onclick={triggerImport} disabled={isImporting}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {isImporting ? 'Import...' : 'Importer'}
          </button>
        </div>
        <input
          type="file"
          accept=".json,application/json"
          bind:this={fileInput}
          onchange={handleImport}
          style="display: none"
        />
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
          <p class="powered-by">Powered by Mathis Sauret</p>
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
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.25rem;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .setting-info {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .setting-icon {
    width: 40px;
    height: 40px;
    background: var(--primary-lighter);
    color: var(--primary-color);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .setting-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .setting-label {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .setting-description {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .toggle-switch {
    width: 52px;
    height: 28px;
    background: var(--border-color);
    border: none;
    border-radius: 14px;
    cursor: pointer;
    position: relative;
    transition: background-color var(--transition-normal);
    flex-shrink: 0;
  }

  .toggle-switch.active {
    background: var(--primary-color);
  }

  .toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    background: #ffffff;
    border-radius: 50%;
    transition: transform var(--transition-normal);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-switch.active .toggle-knob {
    transform: translateX(24px);
  }

  .card-description {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    margin: 0 0 1.25rem;
    line-height: 1.5;
  }

  .data-buttons {
    display: flex;
    gap: 0.75rem;
  }

  .data-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s, opacity 0.2s;
  }

  .data-btn.export {
    background: var(--primary-color);
    color: white;
  }

  .data-btn.export:hover:not(:disabled) {
    background: var(--primary-dark);
  }

  .data-btn.import {
    background: var(--bg-hover);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }

  .data-btn.import:hover:not(:disabled) {
    background: var(--border-color);
  }

  .data-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  .powered-by {
    margin: 1.5rem 0 0;
    font-size: 0.8125rem;
    font-style: italic;
    color: var(--text-muted);
  }

  @media (min-width: 768px) {
    .main-content {
      padding-left: calc(80px + 1rem);
    }
  }
</style>
