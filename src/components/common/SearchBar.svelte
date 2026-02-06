<script>
  let { value = '', placeholder = 'Rechercher...', onSearch } = $props()

  let timeoutId = null

  function handleInput(e) {
    const newValue = e.target.value
    value = newValue

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      onSearch?.(newValue)
    }, 300)
  }

  function handleClear() {
    value = ''
    onSearch?.('')
  }
</script>

<div class="search-bar">
  <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
  <input
    type="text"
    class="search-input"
    {placeholder}
    {value}
    oninput={handleInput}
  />
  {#if value}
    <button class="clear-btn" onclick={handleClear} aria-label="Effacer">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  {/if}
</div>

<style>
  .search-bar {
    display: flex;
    align-items: center;
    flex: 1;
    width: 100%;
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
    border: 1px solid var(--border-color);
    transition: border-color 0.2s;
  }

  .search-bar:focus-within {
    border-color: var(--primary-color);
  }

  .search-icon {
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1rem;
    color: var(--text-primary);
    outline: none;
  }

  .search-input::placeholder {
    color: var(--text-secondary);
  }

  .clear-btn {
    background: transparent;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .clear-btn:hover {
    background: var(--bg-hover);
  }
</style>
