<script lang="ts">
  export let classify = true;
  export let finalChoice = false;
</script>

{#if classify && !finalChoice}
  <div class="grid grid-cols-2 items-start gap-10">
    <div class="flex flex-col gap-10">
      <slot name="preferences" />
      <slot name="solutions" />
    </div>
    <div class="flex flex-col gap-10">
      <slot name="solutionSetChoice" />
      <slot name="visualizations" />
      <slot name="Map" />
    </div>
  </div>
{:else if !finalChoice}
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
    <div class="flex flex-col gap-10">
      <slot name="Map" />
    </div>
  </div>
{/if}
