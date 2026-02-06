<script>
  import InterventionCard from './InterventionCard.svelte'
  import EmptyState from '../common/EmptyState.svelte'

  let { interventions = [], onInterventionClick, onAddClick } = $props()
</script>

<div class="intervention-list">
  {#if interventions.length === 0}
    <EmptyState
      icon="wrench"
      title="Aucune intervention"
      message="Ajoutez une intervention pour ce véhicule"
      actionLabel="Ajouter une intervention"
      onAction={onAddClick}
    />
  {:else}
    <div class="list-container">
      {#each interventions as intervention (intervention.id)}
        <InterventionCard
          {intervention}
          onClick={onInterventionClick}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .intervention-list {
    padding: 1rem;
  }

  .list-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
</style>
