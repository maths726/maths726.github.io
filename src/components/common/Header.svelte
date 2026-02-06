<script>
  let { title = 'Suivi Client', showBack = false, onBack = null } = $props()
</script>

<header class="header">
  <div class="header-content">
    {#if showBack}
      <button class="back-btn" onclick={onBack} aria-label="Retour">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
    {/if}
    <h1 class="header-title">{title}</h1>
  </div>
</header>

<style>
  .header {
    background: var(--primary-color);
    color: white;
    padding: 1rem;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    flex: 1;
  }

  .back-btn {
    background: transparent;
    border: none;
    color: white;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }
</style>
