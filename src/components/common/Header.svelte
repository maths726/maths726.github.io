<script>
  let { title = 'Suivi Client', showBack = false, onBack = null } = $props()
</script>

<header class="header">
  <div class="header-bg"></div>
  <div class="header-content">
    {#if showBack}
      <button class="back-btn" onclick={onBack} aria-label="Retour">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
    {/if}
    <div class="title-section">
      <h1 class="header-title">{title}</h1>
    </div>
  </div>
  <div class="m-stripes">
    <svg viewBox="0 0 60 40" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,40 22,0 34,0 22,40" fill="#81C4FF"/>
      <polygon points="22,40 34,0 46,0 34,40" fill="#16588E"/>
      <polygon points="34,40 46,0 58,0 46,40" fill="#E7222E"/>
    </svg>
  </div>
</header>

<style>
  .header {
    background: var(--primary-gradient);
    color: white;
    padding: 1.25rem 1rem;
    position: sticky;
    top: 0;
    z-index: 100;
    overflow: hidden;
  }

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 100% 0%, rgba(255,255,255,0.1) 0%, transparent 50%),
      radial-gradient(circle at 0% 100%, rgba(255,255,255,0.05) 0%, transparent 50%);
    pointer-events: none;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }

  .title-section {
    flex: 1;
  }

  .header-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .back-btn {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.625rem;
    cursor: pointer;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-normal);
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateX(-2px);
  }

  .m-stripes {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 210px;
    opacity: 0.9;
  }

  .m-stripes svg {
    width: 100%;
    height: 100%;
  }

  @media (min-width: 768px) {
    .header {
      padding: 1.5rem;
    }

    .header-title {
      font-size: 1.75rem;
    }
  }
</style>
