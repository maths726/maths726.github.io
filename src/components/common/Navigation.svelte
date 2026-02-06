<script>
  import { currentRoute } from '../../lib/stores/ui.js'

  let { navigate } = $props()

  const navItems = [
    { path: '/', label: 'Accueil', icon: 'home' },
    { path: '/clients', label: 'Clients', icon: 'users' },
    { path: '/vehicules', label: 'Vehicules', icon: 'car' },
    { path: '/parametres', label: 'Parametres', icon: 'settings' }
  ]

  function handleClick(path) {
    navigate(path)
  }
</script>

<nav class="navigation">
  {#each navItems as item}
    <button
      class="nav-item"
      class:active={$currentRoute === item.path || ($currentRoute.startsWith(item.path) && item.path !== '/')}
      onclick={() => handleClick(item.path)}
    >
      {#if item.icon === 'home'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      {:else if item.icon === 'users'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      {:else if item.icon === 'car'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
          <circle cx="6.5" cy="16.5" r="2.5"/>
          <circle cx="16.5" cy="16.5" r="2.5"/>
        </svg>
      {:else if item.icon === 'settings'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      {/if}
      <span class="nav-label">{item.label}</span>
    </button>
  {/each}
</nav>

<style>
  .navigation {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    display: flex;
    justify-content: space-around;
    padding: 0.5rem 0;
    border-top: 1px solid var(--border-color);
    z-index: 100;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 8px;
    transition: color 0.2s, background-color 0.2s;
  }

  .nav-item:hover {
    background: var(--bg-hover);
  }

  .nav-item.active {
    color: var(--primary-color);
  }

  .nav-label {
    font-size: 0.75rem;
    font-weight: 500;
  }

  @media (min-width: 768px) {
    .navigation {
      top: 0;
      bottom: auto;
      left: 0;
      width: 80px;
      height: 100vh;
      flex-direction: column;
      justify-content: flex-start;
      padding: 1rem 0;
      gap: 0.5rem;
      border-top: none;
      border-right: 1px solid var(--border-color);
      box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
    }
  }
</style>
