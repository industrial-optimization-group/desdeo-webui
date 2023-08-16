<!--
@component
A component for selecting a reference point for the given objectives with
horizontal bars.
-->
<script lang="ts">
  import type { BoundedObjective } from "$lib/api";
  import HorizontalBar from "$lib/components/visual/HorizontalBarWithInputs.svelte";

  /** @readonly */
  export let objectives: BoundedObjective[];

  /**
   * Output variable for the selected value. Must have the same length as
   * `objectives`.
   */
  export let reference_point: (number | undefined)[];

  if (reference_point.length !== objectives.length) {
    throw new Error("Reference point has invalid length");
  }
</script>

<div class="flex flex-col gap-4">
  {#each objectives as { name, min, max }, j}
    <HorizontalBar
      lowerBound={min}
      higherBound={max}
      objectiveName={name}
      bind:selectedValue={reference_point[j]}
    />
  {/each}
</div>
