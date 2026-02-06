<script>
  let { vehicule = null, onSubmit, onCancel } = $props()

  let formData = $state({
    marque: vehicule?.marque || '',
    modele: vehicule?.modele || '',
    annee: vehicule?.annee || '',
    immatriculation: vehicule?.immatriculation || '',
    vin: vehicule?.vin || '',
    kilometrage: vehicule?.kilometrage || '',
    notes: vehicule?.notes || ''
  })

  let errors = $state({})
  let isSubmitting = $state(false)

  const currentYear = new Date().getFullYear()

  function validate() {
    const newErrors = {}

    if (!formData.marque.trim()) {
      newErrors.marque = 'Marque requise'
    }

    if (!formData.immatriculation.trim()) {
      newErrors.immatriculation = 'Immatriculation requise'
    }

    if (formData.annee && (formData.annee < 1900 || formData.annee > currentYear + 1)) {
      newErrors.annee = 'Année invalide'
    }

    if (formData.kilometrage && formData.kilometrage < 0) {
      newErrors.kilometrage = 'Kilométrage invalide'
    }

    errors = newErrors
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validate()) return

    isSubmitting = true
    try {
      await onSubmit?.({
        ...formData,
        annee: formData.annee ? parseInt(formData.annee) : null,
        kilometrage: formData.kilometrage ? parseInt(formData.kilometrage) : 0
      })
    } finally {
      isSubmitting = false
    }
  }
</script>

<form class="vehicule-form" onsubmit={handleSubmit}>
  <div class="form-row">
    <div class="form-group">
      <label for="marque" class="form-label">Marque *</label>
      <input
        type="text"
        id="marque"
        class="form-input"
        class:error={errors.marque}
        bind:value={formData.marque}
        placeholder="Renault"
      />
      {#if errors.marque}
        <span class="form-error">{errors.marque}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="modele" class="form-label">Modèle</label>
      <input
        type="text"
        id="modele"
        class="form-input"
        bind:value={formData.modele}
        placeholder="Clio"
      />
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="immatriculation" class="form-label">Immatriculation *</label>
      <input
        type="text"
        id="immatriculation"
        class="form-input"
        class:error={errors.immatriculation}
        bind:value={formData.immatriculation}
        placeholder="AB-123-CD"
      />
      {#if errors.immatriculation}
        <span class="form-error">{errors.immatriculation}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="annee" class="form-label">Année</label>
      <input
        type="number"
        id="annee"
        class="form-input"
        class:error={errors.annee}
        bind:value={formData.annee}
        placeholder={currentYear}
        min="1900"
        max={currentYear + 1}
      />
      {#if errors.annee}
        <span class="form-error">{errors.annee}</span>
      {/if}
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="kilometrage" class="form-label">Kilométrage</label>
      <input
        type="number"
        id="kilometrage"
        class="form-input"
        class:error={errors.kilometrage}
        bind:value={formData.kilometrage}
        placeholder="50000"
        min="0"
      />
      {#if errors.kilometrage}
        <span class="form-error">{errors.kilometrage}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="vin" class="form-label">VIN (optionnel)</label>
      <input
        type="text"
        id="vin"
        class="form-input"
        bind:value={formData.vin}
        placeholder="VF1XXXXXXXXX"
      />
    </div>
  </div>

  <div class="form-group">
    <label for="notes" class="form-label">Notes</label>
    <textarea
      id="notes"
      class="form-textarea"
      bind:value={formData.notes}
      placeholder="Notes ou remarques..."
      rows="3"
    ></textarea>
  </div>

  <div class="form-actions">
    <button type="button" class="btn btn-secondary" onclick={onCancel} disabled={isSubmitting}>
      Annuler
    </button>
    <button type="submit" class="btn btn-primary" disabled={isSubmitting}>
      {isSubmitting ? 'Enregistrement...' : (vehicule ? 'Modifier' : 'Ajouter')}
    </button>
  </div>
</form>

<style>
  .vehicule-form {
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

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .form-input.error,
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
