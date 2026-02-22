<script>
  import Header from '../components/common/Header.svelte'
  import { exportAndDownload, exportAllData, importData, readJSONFile } from '../lib/utils/export.js'
  import { showToast, darkMode } from '../lib/stores/ui.js'
  import { syncStore } from '../lib/stores/sync.js'
  import {
    initGoogleAuth,
    signIn,
    signOut,
    uploadBackup,
    downloadBackup,
    refreshTokenIfNeeded
  } from '../lib/sync/gdrive.js'
  import { onMount } from 'svelte'

  // Google OAuth Client ID - Configure this in Google Cloud Console
  const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '898227579532-r7ccqbba4e65rvdokf3746g6rlkn9cce.apps.googleusercontent.com').trim()
  
  console.log('📝 Using Client ID:', GOOGLE_CLIENT_ID)

  let isExporting = $state(false)
  let isImporting = $state(false)
  let fileInput
  let isGoogleAuthReady = $state(false)
  let isConnecting = $state(false)
  let isSyncingToCloud = $state(false)
  let isRestoring = $state(false)

  onMount(async () => {
    if (GOOGLE_CLIENT_ID) {
      try {
        await initGoogleAuth(GOOGLE_CLIENT_ID)
        isGoogleAuthReady = true
        // Refresh token if needed
        const isValid = await refreshTokenIfNeeded()
        if (!isValid && $syncStore.isConnected) {
          // Token expired, reset connection state
          syncStore.setDisconnected()
        }
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error)
      }
    }
  })

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

  async function handleGoogleConnect() {
    console.log('🎯 handleGoogleConnect called')
    isConnecting = true
    try {
      console.log('📞 Calling signIn()...')
      const userInfo = await signIn()
      console.log('✅ signIn() returned:', userInfo)
      syncStore.setConnected(userInfo.email)
      showToast('Connecté à Google Drive', 'success')
      console.log('✅ Connection complete!')
    } catch (error) {
      console.error('❌ Error in handleGoogleConnect:', error)
      showToast(error.message || 'Erreur de connexion', 'error')
    } finally {
      isConnecting = false
      console.log('🏁 handleGoogleConnect finished')
    }
  }

  function handleGoogleDisconnect() {
    signOut()
    syncStore.setDisconnected()
    showToast('Déconnecté de Google Drive', 'info')
  }

  async function handleSyncToCloud() {
    isSyncingToCloud = true
    syncStore.setSyncing(true)
    try {
      const data = await exportAllData()
      const result = await uploadBackup(data)
      syncStore.setLastSync(result.modifiedTime || new Date().toISOString())
      showToast('Données synchronisées', 'success')
    } catch (error) {
      syncStore.setError(error.message)
      showToast(error.message || 'Erreur de synchronisation', 'error')
    } finally {
      isSyncingToCloud = false
      syncStore.setSyncing(false)
    }
  }

  async function handleRestoreFromCloud() {
    isRestoring = true
    try {
      const data = await downloadBackup()
      if (!data) {
        showToast('Aucune sauvegarde trouvée', 'info')
        return
      }
      const result = await importData(data)
      const total = result.clients + result.vehicules + result.interventions
      if (total > 0) {
        showToast(`${total} élément(s) restauré(s)`, 'success')
      } else {
        showToast('Données déjà à jour', 'info')
      }
    } catch (error) {
      showToast(error.message || 'Erreur de restauration', 'error')
    } finally {
      isRestoring = false
    }
  }

  function formatLastSync(isoString) {
    if (!isoString) return 'Jamais'
    const date = new Date(isoString)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <h2 class="section-title">Synchronisation Cloud</h2>
      <div class="card">
        {#if !GOOGLE_CLIENT_ID}
          <div class="sync-not-configured">
            <div class="setting-icon warning-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p class="card-description">
              La synchronisation Google Drive n'est pas configurée.
              Ajoutez <code>VITE_GOOGLE_CLIENT_ID</code> dans vos variables d'environnement.
            </p>
          </div>
        {:else if !$syncStore.isConnected}
          <p class="card-description">
            Synchronisez vos données avec Google Drive pour les sauvegarder et les restaurer sur d'autres appareils.
          </p>
          <button
            class="google-btn connect"
            onclick={handleGoogleConnect}
            disabled={!isGoogleAuthReady || isConnecting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isConnecting ? 'Connexion...' : 'Connecter Google Drive'}
          </button>
        {:else}
          <div class="sync-connected">
            <div class="sync-status">
              <div class="sync-user">
                <div class="setting-icon google-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div class="sync-info">
                  <span class="sync-email">{$syncStore.userEmail}</span>
                  <span class="sync-last">
                    {#if $syncStore.isSyncing}
                      <span class="syncing-indicator">Synchronisation...</span>
                    {:else}
                      Dernière sync : {formatLastSync($syncStore.lastSyncAt)}
                    {/if}
                  </span>
                </div>
              </div>
            </div>

            {#if $syncStore.error}
              <div class="sync-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {$syncStore.error}
              </div>
            {/if}

            <div class="sync-actions">
              <button
                class="data-btn export"
                onclick={handleSyncToCloud}
                disabled={isSyncingToCloud}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                {isSyncingToCloud ? 'Synchronisation...' : 'Synchroniser'}
              </button>
              <button
                class="data-btn import"
                onclick={handleRestoreFromCloud}
                disabled={isRestoring}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {isRestoring ? 'Restauration...' : 'Restaurer'}
              </button>
            </div>

            <button class="disconnect-btn" onclick={handleGoogleDisconnect}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Déconnecter
            </button>
          </div>
        {/if}
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

  /* Google Drive Sync Styles */
  .sync-not-configured {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
  }

  .sync-not-configured .card-description {
    margin: 0;
    flex: 1;
  }

  .sync-not-configured code {
    background: var(--bg-hover);
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-size: 0.8125rem;
  }

  .warning-icon {
    background: rgba(234, 179, 8, 0.15) !important;
    color: #eab308 !important;
  }

  .google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.875rem;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .google-btn:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--text-secondary);
  }

  .google-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .sync-connected {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sync-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .sync-user {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .google-icon {
    background: var(--bg-hover) !important;
  }

  .sync-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .sync-email {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .sync-last {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .syncing-indicator {
    color: var(--primary-color);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .sync-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    font-size: 0.875rem;
  }

  .sync-actions {
    display: flex;
    gap: 0.75rem;
  }

  .disconnect-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.625rem;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
  }

  .disconnect-btn:hover {
    background: var(--bg-hover);
    color: #ef4444;
  }

  @media (min-width: 768px) {
    .main-content {
      padding-left: calc(80px + 1rem);
    }
  }
</style>