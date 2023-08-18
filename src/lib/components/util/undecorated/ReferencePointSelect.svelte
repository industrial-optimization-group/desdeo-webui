<!--
@component
A component for selecting a reference point for the given objectives with
horizontal bars.

NOTE: Not fully functional.
-->
<script lang="ts">
  import type { BoundedObjective, Point } from "$lib/api";
  import { is_point } from "$lib/api";
  import HorizontalBar from "$lib/components/visual/HorizontalBarWithInputs.svelte";

  export let objectives: BoundedObjective[];
  export let selected_solution: Point | undefined = undefined;
  export let previous_preference: Point | undefined = undefined;
  export let reference_point: Point | undefined = undefined;

  //
  // TODO: This should be reactive because it depends on the length
  // of `objectives`. I was not able to get reactivity working.
  //
  let selected_preference: (number | undefined)[] = objectives.map(
    () => undefined
  );

  $: if (is_point(selected_preference)) {
    reference_point = [...selected_preference];
  }

  $: if (selected_solution && selected_solution.length !== objectives.length) {
    throw new Error("`selected_solution` has invalid length");
  }

  $: if (
    previous_preference &&
    previous_preference.length !== objectives.length
  ) {
    throw new Error("`previous_preference` has invalid length");
  }
</script>

<div class="flex flex-col gap-4">
  <div class="mb-4">
    Please select an aspiration level for each of the objectives using the
    horizontal bar or the input box. The input box can be used to enter a value
    outside the range of the horizontal bar.
  </div>
  {#each objectives as { name, min, max }, j}
    <HorizontalBar
      lowerBound={min}
      higherBound={max}
      objectiveName={name}
      solutionValue={selected_solution ? selected_solution[j] : undefined}
      previousValue={previous_preference ? previous_preference[j] : undefined}
      bind:selectedValue={selected_preference[j]}
    />
  {/each}
</div>
