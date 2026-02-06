<script>
  let { isOpen = false, title = '', onClose } = $props()

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onClose?.()
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-header-content">
          <div class="modal-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <h2 id="modal-title" class="modal-title">{title}</h2>
        </div>
        <button class="modal-close" onclick={onClose} aria-label="Fermer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal-content">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .modal {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: var(--shadow-xl), 0 0 0 1px rgba(0, 0, 0, 0.05);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    background: linear-gradient(to bottom, var(--bg-primary), var(--bg-card));
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header-content {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .modal-icon {
    width: 40px;
    height: 40px;
    background: var(--primary-gradient);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 102, 177, 0.3);
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
  }

  .modal-close {
    background: transparent;
    border: none;
    padding: 0.625rem;
    cursor: pointer;
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
  }

  .modal-close:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .modal-content {
    padding: 1.5rem;
    overflow-y: auto;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
