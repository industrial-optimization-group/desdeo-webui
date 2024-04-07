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
  export let minPreference: (number | undefined)[];
  export let maxPreference: (number | undefined)[];
  export let previous_min_preference: number[] | undefined = undefined;
  export let previous_max_preference: number[] | undefined = undefined;
  export let reference_solution: number[] | undefined = undefined;

  // Create a local copy to avoid mutating the original copy.
  $: minPreference = [...minPreference];
  $: maxPreference = [...maxPreference];

  import HorizontalRangeBarWithInputs from "$lib/components/visual/preference-interaction/HorizontalRangeBarWithInputs.svelte";
  import { colorPalette } from "$lib/components/visual/constants";
</script>

<div class="flex flex-col gap-4">
  {#each objective_names as objective_name, j}
    <HorizontalRangeBarWithInputs
      barName={objective_name}
      lowerBound={lower_bounds[j]}
      higherBound={upper_bounds[j]}
      previousMinValue={previous_min_preference ? previous_min_preference[j] : undefined}
      previousMaxValue={previous_max_preference ? previous_max_preference[j] : undefined}
      solutionValue={reference_solution ? reference_solution[j] : undefined}
      barColor={colorPalette[j % colorPalette.length]}
      arrowMode={true}
      bind:selectedMinValue={minPreference[j]}
      bind:selectedMaxValue={maxPreference[j]}
      decimalPrecision={4}
    />
  {/each}
</div>
