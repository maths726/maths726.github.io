<script>
  let { vehicule = null, onSubmit, onCancel } = $props()

  let formData = $state({
    marque: vehicule?.marque || '',
    modele: vehicule?.modele || '',
    moisMiseEnCirculation: vehicule?.moisMiseEnCirculation || '',
    anneeMiseEnCirculation: vehicule?.anneeMiseEnCirculation || '',
    immatriculation: vehicule?.immatriculation || '',
    vin: vehicule?.vin || '',
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

    if (formData.anneeMiseEnCirculation && (formData.anneeMiseEnCirculation < 1900 || formData.anneeMiseEnCirculation > currentYear + 1)) {
      newErrors.anneeMiseEnCirculation = 'Année invalide'
    }

    if (formData.moisMiseEnCirculation && (formData.moisMiseEnCirculation < 1 || formData.moisMiseEnCirculation > 12)) {
      newErrors.moisMiseEnCirculation = 'Mois invalide'
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
        moisMiseEnCirculation: formData.moisMiseEnCirculation ? parseInt(formData.moisMiseEnCirculation) : null,
        anneeMiseEnCirculation: formData.anneeMiseEnCirculation ? parseInt(formData.anneeMiseEnCirculation) : null
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
      <label for="moisMiseEnCirculation" class="form-label">Mise en circulation</label>
      <div class="date-row">
        <select
          id="moisMiseEnCirculation"
          class="form-input"
          class:error={errors.moisMiseEnCirculation}
          bind:value={formData.moisMiseEnCirculation}
        >
          <option value="">Mois</option>
          <option value="1">Janvier</option>
          <option value="2">Février</option>
          <option value="3">Mars</option>
          <option value="4">Avril</option>
          <option value="5">Mai</option>
          <option value="6">Juin</option>
          <option value="7">Juillet</option>
          <option value="8">Août</option>
          <option value="9">Septembre</option>
          <option value="10">Octobre</option>
          <option value="11">Novembre</option>
          <option value="12">Décembre</option>
        </select>
        <input
          type="number"
          id="anneeMiseEnCirculation"
          class="form-input"
          class:error={errors.anneeMiseEnCirculation}
          bind:value={formData.anneeMiseEnCirculation}
          placeholder={currentYear}
          min="1900"
          max={currentYear + 1}
        />
      </div>
      {#if errors.moisMiseEnCirculation}
        <span class="form-error">{errors.moisMiseEnCirculation}</span>
      {/if}
      {#if errors.anneeMiseEnCirculation}
        <span class="form-error">{errors.anneeMiseEnCirculation}</span>
      {/if}
    </div>
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

  .date-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
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
    background: var(--bg-card);
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
