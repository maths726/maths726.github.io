<script>
  import { TYPES_INTERVENTION, STATUTS_INTERVENTION } from '../../lib/db/interventions.js'

  let { intervention = null, onSubmit, onCancel } = $props()

  const today = new Date().toISOString().split('T')[0]

  let formData = $state({
    type: intervention?.type || 'entretien',
    description: intervention?.description || '',
    date: intervention?.date || today,
    kilometrage: intervention?.kilometrage || '',
    coutEstime: intervention?.coutEstime || '',
    coutFinal: intervention?.coutFinal || '',
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

    if (formData.coutEstime && formData.coutEstime < 0) {
      newErrors.coutEstime = 'Coût invalide'
    }

    if (formData.coutFinal && formData.coutFinal < 0) {
      newErrors.coutFinal = 'Coût invalide'
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
        coutEstime: formData.coutEstime ? parseFloat(formData.coutEstime) : null,
        coutFinal: formData.coutFinal ? parseFloat(formData.coutFinal) : null,
        pieces
      })
    } finally {
      isSubmitting = false
    }
  }
</script>

<form class="intervention-form" onsubmit={handleSubmit}>
  <div class="form-row">
    <div class="form-group">
      <label for="type" class="form-label">Type *</label>
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
      <label for="statut" class="form-label">Statut</label>
      <select
        id="statut"
        class="form-select"
        bind:value={formData.statut}
      >
        {#each STATUTS_INTERVENTION as statut}
          <option value={statut.value}>{statut.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="form-group">
    <label for="description" class="form-label">Description *</label>
    <textarea
      id="description"
      class="form-textarea"
      class:error={errors.description}
      bind:value={formData.description}
      placeholder="Décrivez l'intervention..."
      rows="3"
    ></textarea>
    {#if errors.description}
      <span class="form-error">{errors.description}</span>
    {/if}
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="date" class="form-label">Date *</label>
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

    <div class="form-group">
      <label for="kilometrage" class="form-label">Kilométrage</label>
      <input
        type="number"
        id="kilometrage"
        class="form-input"
        bind:value={formData.kilometrage}
        placeholder="50000"
        min="0"
      />
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="coutEstime" class="form-label">Coût estimé (€)</label>
      <input
        type="number"
        id="coutEstime"
        class="form-input"
        class:error={errors.coutEstime}
        bind:value={formData.coutEstime}
        placeholder="150.00"
        min="0"
        step="0.01"
      />
      {#if errors.coutEstime}
        <span class="form-error">{errors.coutEstime}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="coutFinal" class="form-label">Coût final (€)</label>
      <input
        type="number"
        id="coutFinal"
        class="form-input"
        class:error={errors.coutFinal}
        bind:value={formData.coutFinal}
        placeholder="175.00"
        min="0"
        step="0.01"
      />
      {#if errors.coutFinal}
        <span class="form-error">{errors.coutFinal}</span>
      {/if}
    </div>
  </div>

  <div class="form-group">
    <label for="pieces" class="form-label">Pièces utilisées</label>
    <input
      type="text"
      id="pieces"
      class="form-input"
      bind:value={formData.pieces}
      placeholder="Filtre à huile, huile 5W30, filtre à air..."
    />
    <span class="form-hint">Séparez les pièces par des virgules</span>
  </div>

  <div class="form-group">
    <label for="notes" class="form-label">Notes</label>
    <textarea
      id="notes"
      class="form-textarea"
      bind:value={formData.notes}
      placeholder="Notes ou remarques..."
      rows="2"
    ></textarea>
  </div>

  <div class="form-actions">
    <button type="button" class="btn btn-secondary" onclick={onCancel} disabled={isSubmitting}>
      Annuler
    </button>
    <button type="submit" class="btn btn-primary" disabled={isSubmitting}>
      {isSubmitting ? 'Enregistrement...' : (intervention ? 'Modifier' : 'Ajouter')}
    </button>
  </div>
</form>

<style>
  .intervention-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    color: var(--text-primary);
    background: white;
    transition: border-color 0.2s;
  }

  .form-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .form-input.error,
  .form-select.error,
  .form-textarea.error {
    border-color: #ef4444;
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .form-error {
    font-size: 0.75rem;
    color: #ef4444;
  }

  .form-hint {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s, opacity 0.2s;
    border: none;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--primary-color);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--primary-dark);
  }

  .btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--bg-hover);
  }

  @media (max-width: 480px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
