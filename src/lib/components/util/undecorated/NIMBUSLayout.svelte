<script lang="ts">
  export let classify = true;
  export let finalChoice = false;

  export let voteChoice = false;
  export let drawMap = true;
</script>

{#if classify && !finalChoice && !voteChoice}
  <div class="grid grid-cols-2 items-start gap-10">
    <div class="flex flex-col gap-10">
      <slot name="preferences" />
      <slot name="solutions" />
    </div>
    <div class="flex flex-col gap-10">
      <slot name="solutionSetChoice" />
      <slot name="visualizations" />
      {#if drawMap}
        <slot name="Map" />
      {/if}
    </div>
  </div>
{:else if !finalChoice && !voteChoice}
  <div class="grid grid-cols-2 items-start gap-10">
    <div class="flex flex-col gap-10">
      <slot name="preferences" />
    </div>
    <div class="flex flex-col gap-10">
      <slot name="solutionSetChoice" />
      <slot name="solutions" />
      <slot name="visualizations" />
    </div>
  </div>
{:else}
  <div class="grid grid-cols-2 items-start gap-10">
    <div class="flex flex-col gap-10">
      <slot name="visualizations" />
      <slot name="solutions" />
    </div>
    {#if drawMap}
      <div class="flex flex-col gap-10">
        <slot name="Map" />
      </div>
    {/if}
  </div>
{/if}
