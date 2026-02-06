<script>
  import ClientCard from './ClientCard.svelte'
  import EmptyState from '../common/EmptyState.svelte'

  let { clients = [], vehiculeCounts = {}, onClientClick, onAddClick } = $props()
</script>

<div class="client-list">
  {#if clients.length === 0}
    <EmptyState
      icon="users"
      title="Aucun client"
      message="Commencez par ajouter votre premier client"
      actionLabel="Ajouter un client"
      onAction={onAddClick}
    />
  {:else}
    <div class="list-container">
      {#each clients as client (client.id)}
        <ClientCard
          {client}
          vehiculeCount={vehiculeCounts[client.id] || 0}
          onClick={onClientClick}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .client-list {
    padding: 1rem;
  }

  .list-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
</style>
