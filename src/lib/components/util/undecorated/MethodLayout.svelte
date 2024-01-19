<script lang="ts">
  export let visualizations_maximized = false;
</script>

{#if visualizations_maximized}
  <div class="grid grid-cols-2 items-start gap-10">
    <div class="col-span-2">
      <slot name="visualizations" />
    </div>
    <slot name="preferences" />
    <slot name="solutions" />
  </div>
{:else}
  <div class="grid grid-cols-2 items-start gap-10">
    <div class="flex flex-col gap-10">
      <slot name="preferences" />
    </div>
    <div class="flex flex-col gap-10">
      <slot name="visualizations" />
      <slot name="solutions" />
    </div>
  </div>
{/if}
