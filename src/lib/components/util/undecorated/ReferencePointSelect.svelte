<!--
@component
A component for selecting a reference point with horizontal bars.

NOTE: The component will MODIFY the `preference` array instead of returning
a new array.

NOTE: The user of the component is responsible for verifying that
`objective_names`, `lower_bounds`, `upper_bounds`, `preference`,
`previous_preference` and `selected_solution` have the same length,
if they are defined.
-->
<script lang="ts">
  export let objective_names: string[];
  export let lower_bounds: number[];
  export let upper_bounds: number[];
  export let preference: (number | undefined)[];
  export let previous_preference: number[] | undefined = undefined;
  export let selected_solution: number[] | undefined = undefined;

  import HorizontalBarWithInputs from "$lib/components/visual/preference-interaction/HorizontalBarWithInputs.svelte";
  import { colorPalette } from "$lib/components/visual/constants";
</script>

<div class="flex flex-col gap-4">
  <div class="mb-4">
    Please select an aspiration level for each of the objectives using the
    horizontal bar or the input box. The input box can be used to enter a value
    outside the range of the horizontal bar.
  </div>
  {#each objective_names as objective_name, j}
    <HorizontalBarWithInputs
      barName={objective_name}
      lowerBound={lower_bounds[j]}
      higherBound={upper_bounds[j]}
      previousValue={previous_preference ? previous_preference[j] : undefined}
      solutionValue={selected_solution ? selected_solution[j] : undefined}
      barColor={colorPalette[j % colorPalette.length]}
      bind:selectedValue={preference[j]}
    />
  {/each}
</div>
