<!--
@component
A component for selecting a reference point with horizontal bars.

NOTE: The user of the component is responsible for verifying that
`objective_names`, `lower_bounds`, `upper_bounds`, `preference`,
`previous_preference` and `reference_solution` have the same length,
if they are defined.
-->
<script lang="ts">
  export let objective_names: string[];
  export let lower_bounds: number[];
  export let upper_bounds: number[];
  export let preference: (number | undefined)[];
  export let previous_preference: number[] | undefined = undefined;
  export let reference_solution: number[] | undefined = undefined;

  // Create a local copy to avoid mutating the original copy.
  $: preference = [...preference];

  import HorizontalBarWithInputs from "$lib/components/visual/preference-interaction/HorizontalBarWithInputs.svelte";
  import { colorPalette } from "$lib/components/visual/constants";
</script>

<div class="flex flex-col gap-4">
  {#each objective_names as objective_name, j}
    <HorizontalBarWithInputs
      barName={objective_name}
      lowerBound={lower_bounds[j]}
      higherBound={upper_bounds[j]}
      previousValue={previous_preference ? previous_preference[j] : undefined}
      solutionValue={reference_solution ? reference_solution[j] : undefined}
      barColor={colorPalette[j % colorPalette.length]}
      arrowMode={true}
      bind:selectedValue={preference[j]}
      decimalPrecision={4}
    />
  {/each}
</div>
