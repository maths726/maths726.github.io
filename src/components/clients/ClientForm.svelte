<script>
  let { client = null, onSubmit, onCancel } = $props()

  let formData = $state({
    nom: client?.nom || '',
    prenom: client?.prenom || '',
    telephone: client?.telephone || '',
    email: client?.email || '',
    adresse: client?.adresse || '',
    notes: client?.notes || ''
  })

  let errors = $state({})
  let isSubmitting = $state(false)

  function validate() {
    const newErrors = {}

    if (!formData.nom.trim()) {
      newErrors.nom = 'Nom requis'
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Téléphone requis'
    } else if (!/^[\d\s+.-]{10,}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Numéro de téléphone invalide'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    errors = newErrors
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validate()) return

    isSubmitting = true
    try {
      await onSubmit?.(formData)
    } finally {
      isSubmitting = false
    }
  }
</script>

<form class="client-form" onsubmit={handleSubmit}>
  <div class="form-row">
    <div class="form-group">
      <label for="prenom" class="form-label">Prénom</label>
      <input
        type="text"
        id="prenom"
        class="form-input"
        bind:value={formData.prenom}
        placeholder="Jean"
      />
    </div>

    <div class="form-group">
      <label for="nom" class="form-label">Nom *</label>
      <input
        type="text"
        id="nom"
        class="form-input"
        class:error={errors.nom}
        bind:value={formData.nom}
        placeholder="Dupont"
      />
      {#if errors.nom}
        <span class="form-error">{errors.nom}</span>
      {/if}
    </div>
  </div>

  <div class="form-group">
    <label for="telephone" class="form-label">Téléphone *</label>
    <input
      type="tel"
      id="telephone"
      class="form-input"
      class:error={errors.telephone}
      bind:value={formData.telephone}
      placeholder="06 12 34 56 78"
    />
    {#if errors.telephone}
      <span class="form-error">{errors.telephone}</span>
    {/if}
  </div>

  <div class="form-group">
    <label for="email" class="form-label">Email</label>
    <input
      type="email"
      id="email"
      class="form-input"
      class:error={errors.email}
      bind:value={formData.email}
      placeholder="jean.dupont@email.com"
    />
    {#if errors.email}
      <span class="form-error">{errors.email}</span>
    {/if}
  </div>

  <div class="form-group">
    <label for="adresse" class="form-label">Adresse</label>
    <input
      type="text"
      id="adresse"
      class="form-input"
      bind:value={formData.adresse}
      placeholder="123 rue de la Paix, 75001 Paris"
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
      {isSubmitting ? 'Enregistrement...' : (client ? 'Modifier' : 'Ajouter')}
    </button>
  </div>
</form>

<style>
  .client-form {
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
