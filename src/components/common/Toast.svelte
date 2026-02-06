<script>
  import { toast, hideToast } from '../../lib/stores/ui.js'
</script>

{#if $toast.isVisible}
  <div class="toast toast-{$toast.type}" role="alert">
    <span class="toast-message">{$toast.message}</span>
    <button class="toast-close" onclick={hideToast} aria-label="Fermer">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1100;
    animation: slideIn 0.3s ease;
    max-width: calc(100% - 2rem);
  }

  .toast-info {
    background: #3b82f6;
    color: white;
  }

  .toast-success {
    background: #22c55e;
    color: white;
  }

  .toast-error {
    background: #ef4444;
    color: white;
  }

  .toast-warning {
    background: #f59e0b;
    color: white;
  }

  .toast-message {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .toast-close {
    background: transparent;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    color: inherit;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: opacity 0.2s;
  }

  .toast-close:hover {
    opacity: 1;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @media (min-width: 768px) {
    .toast {
      bottom: 2rem;
    }
  }
</style>
