<script>
  import { TYPES_INTERVENTION, STATUTS_INTERVENTION } from '../../lib/db/interventions.js'

  let { intervention = null, onSubmit, onCancel } = $props()

  const today = new Date().toISOString().split('T')[0]

  let formData = $state({
    type: intervention?.type || 'entretien',
    description: intervention?.description || '',
    date: intervention?.date || today,
    kilometrage: intervention?.kilometrage || '',
    cout: intervention?.cout || '',
    pieces: intervention?.pieces?.join(', ') || '',
    statut: intervention?.statut || 'en_cours',
    notes: intervention?.notes || ''
  })

  let errors = $state({})
  let isSubmitting = $state(false)

  function validate() {
    const newErrors = {}

    if (!formData.type) {
      newErrors.type = 'Type requis'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description requise'
    }

    if (!formData.date) {
      newErrors.date = 'Date requise'
    }

    if (formData.cout && formData.cout < 0) {
      newErrors.cout = 'Cout invalide'
    }

    errors = newErrors
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validate()) return

    isSubmitting = true
    try {
      const pieces = formData.pieces
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0)

      await onSubmit?.({
        ...formData,
        kilometrage: formData.kilometrage ? parseInt(formData.kilometrage) : 0,
        cout: formData.cout ? parseFloat(formData.cout) : null,
        pieces
      })
    } finally {
      isSubmitting = false
    }
  }

  function getStatusIcon(value) {
    if (value === 'en_attente') return 'clock'
    if (value === 'en_cours') return 'tool'
    return 'check'
  }
</script>

<form class="intervention-form" onsubmit={handleSubmit}>
  <div class="status-section">
    <span class="status-label">Statut de l'intervention</span>
    <div class="status-buttons">
      {#each STATUTS_INTERVENTION as statut}
        <button
          type="button"
          class="status-btn status-{statut.value}"
          class:active={formData.statut === statut.value}
          onclick={() => formData.statut = statut.value}
        >
          <span class="status-icon">
            {#if statut.value === 'en_attente'}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            {:else if statut.value === 'en_cours'}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            {/if}
          </span>
          <span class="status-text">{statut.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="form-divider"></div>

  <div class="form-row">
    <div class="form-group">
      <label for="type" class="form-label">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
        Type *
      </label>
      <select
        id="type"
        class="form-select"
        class:error={errors.type}
        bind:value={formData.type}
      >
        {#each TYPES_INTERVENTION as type}
          <option value={type.value}>{type.label}</option>
        {/each}
      </select>
      {#if errors.type}
        <span class="form-error">{errors.type}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="date" class="form-label">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Date *
      </label>
      <input
        type="date"
        id="date"
        class="form-input"
        class:error={errors.date}
        bind:value={formData.date}
      />
      {#if errors.date}
        <span class="form-error">{errors.date}</span>
      {/if}
    </div>
  </div>

  <div class="form-group">
    <label for="description" class="form-label">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="17" y1="10" x2="3" y2="10"/>
        <line x1="21" y1="6" x2="3" y2="6"/>
        <line x1="21" y1="14" x2="3" y2="14"/>
        <line x1="17" y1="18" x2="3" y2="18"/>
      </svg>
      Description *
    </label>
    <textarea
      id="description"
      class="form-textarea"
      class:error={errors.description}
      bind:value={formData.description}
      placeholder="Decrivez l'intervention..."
      rows="3"
    ></textarea>
    {#if errors.description}
      <span class="form-error">{errors.description}</span>
    {/if}
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="kilometrage" class="form-label">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Kilometrage
      </label>
      <div class="input-with-suffix">
        <input
          type="number"
          id="kilometrage"
          class="form-input"
          bind:value={formData.kilometrage}
          placeholder="50000"
          min="0"
        />
        <span class="input-suffix">km</span>
      </div>
    </div>

    <div class="form-group">
      <label for="cout" class="form-label">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        Cout
      </label>
      <div class="input-with-suffix">
        <input
          type="number"
          id="cout"
          class="form-input"
          class:error={errors.cout}
          bind:value={formData.cout}
          placeholder="150.00"
          min="0"
          step="0.01"
        />
        <span class="input-suffix">EUR</span>
      </div>
      {#if errors.cout}
        <span class="form-error">{errors.cout}</span>
      {/if}
    </div>
  </div>

  <div class="form-group">
    <label for="pieces" class="form-label">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
      Pieces changees
    </label>
    <input
      type="text"
      id="pieces"
      class="form-input"
      bind:value={formData.pieces}
      placeholder="Filtre a huile, huile 5W30, filtre a air..."
    />
    <span class="form-hint">Separees par des virgules</span>
  </div>

  <div class="form-group">
    <label for="notes" class="form-label">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      Notes
    </label>
    <textarea
      id="notes"
      class="form-textarea"
      bind:value={formData.notes}
      placeholder="Notes ou remarques supplementaires..."
      rows="2"
    ></textarea>
  </div>

  <div class="form-actions">
    <button type="button" class="btn btn-secondary" onclick={onCancel} disabled={isSubmitting}>
      Annuler
    </button>
    <button type="submit" class="btn btn-primary" disabled={isSubmitting}>
      {#if isSubmitting}
        <span class="btn-spinner"></span>
        Enregistrement...
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        {intervention ? 'Enregistrer' : 'Ajouter'}
      {/if}
    </button>
  </div>
</form>

<style>
  .intervention-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .status-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .status-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-buttons {
    display: flex;
    gap: 0.625rem;
  }

  .status-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    cursor: pointer;
    transition: all var(--transition-normal);
  }

  .status-btn:hover {
    border-color: var(--text-muted);
    background: var(--bg-primary);
  }

  .status-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-normal);
  }

  .status-btn.status-en_attente .status-icon {
    background: #f3f4f6;
    color: #6b7280;
  }

  .status-btn.status-en_cours .status-icon {
    background: #fef3c7;
    color: #b45309;
  }

  .status-btn.status-termine .status-icon {
    background: #d1fae5;
    color: #059669;
  }

  .status-text {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .status-btn.active {
    border-color: var(--primary-color);
    background: var(--primary-lighter);
  }

  .status-btn.active .status-text {
    color: var(--primary-color);
  }

  .status-btn.active.status-en_attente {
    border-color: #6b7280;
    background: #f9fafb;
  }
  .status-btn.active.status-en_attente .status-text {
    color: #374151;
  }

  .status-btn.active.status-en_cours {
    border-color: #f59e0b;
    background: #fffbeb;
  }
  .status-btn.active.status-en_cours .status-text {
    color: #b45309;
  }

  .status-btn.active.status-termine {
    border-color: #10b981;
    background: #ecfdf5;
  }
  .status-btn.active.status-termine .status-text {
    color: #059669;
  }

  .form-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, var(--border-color), transparent);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .form-label svg {
    color: var(--text-muted);
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 0.875rem 1rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
    color: var(--text-primary);
    background: var(--bg-card);
    transition: all var(--transition-fast);
  }

  .form-input:hover,
  .form-select:hover,
  .form-textarea:hover {
    border-color: var(--text-muted);
  }

  .form-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.75rem center;
    background-repeat: no-repeat;
    background-size: 1.25em 1.25em;
    padding-right: 2.5rem;
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 102, 177, 0.1);
  }

  .form-input.error,
  .form-select.error,
  .form-textarea.error {
    border-color: var(--accent-red);
  }

  .form-textarea {
    resize: vertical;
    min-height: 88px;
  }

  .input-with-suffix {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-with-suffix .form-input {
    padding-right: 3.5rem;
  }

  .input-suffix {
    position: absolute;
    right: 1rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-muted);
    pointer-events: none;
  }

  .form-error {
    font-size: 0.75rem;
    color: var(--accent-red);
    font-weight: 500;
  }

  .form-hint {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-light);
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-normal);
    border: none;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--primary-gradient);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 102, 177, 0.3);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 102, 177, 0.4);
  }

  .btn-secondary {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 2px solid var(--border-color);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--text-muted);
  }

  .btn-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 480px) {
    .form-row {
      grid-template-columns: 1fr;
    }

    .status-buttons {
      flex-direction: column;
    }

    .status-btn {
      flex-direction: row;
      justify-content: center;
      padding: 0.875rem 1rem;
    }
  }
</style>
