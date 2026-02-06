<script>
  import VehiculeCard from './VehiculeCard.svelte'
  import EmptyState from '../common/EmptyState.svelte'

  let { vehicules = [], interventionCounts = {}, onVehiculeClick, onAddClick } = $props()
</script>

<div class="vehicule-list">
  {#if vehicules.length === 0}
    <EmptyState
      icon="car"
      title="Aucun véhicule"
      message="Ajoutez un véhicule pour ce client"
      actionLabel="Ajouter un véhicule"
      onAction={onAddClick}
    />
  {:else}
    <div class="list-container">
      {#each vehicules as vehicule (vehicule.id)}
        <VehiculeCard
          {vehicule}
          interventionCount={interventionCounts[vehicule.id] || 0}
          onClick={onVehiculeClick}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .vehicule-list {
    padding: 1rem;
  }

  .list-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
</style>
