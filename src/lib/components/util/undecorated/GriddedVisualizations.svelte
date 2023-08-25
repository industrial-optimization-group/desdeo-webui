<script lang="ts" context="module">
  export type Point = number[];
</script>

<script lang="ts">
  export let names: string[] | undefined = undefined;
  export let values: Point[];
  export let bounds: { min: number; max: number }[];
  export let lower_is_better: boolean[];
  export let selected: number[] = [];
  export let max_selections: number | undefined = undefined;
  export let highlighted: number | undefined = undefined;
  export let disabled = false;

  //
  // NOTE: The user of the component is responsible for verifying that `names`,
  // `values`, `bounds` and `lower_is_better` have the same length.
  //

  // Import the visualizations here.
  import ParallelCoordinatePlotBase from "$lib/components/visual/visualization/props-linking/ParallelCoordinatePlotBase.svelte";
  import RadarChart from "$lib/components/visual/visualization/props-linking/RadarChart.svelte";
  // import { colorPalette } from "$lib/components/visual/constants";
</script>

<div class="grid grid-cols-2 gap-10">
  <ParallelCoordinatePlotBase
    {names}
    {values}
    ranges={bounds}
    lowerIsBetter={lower_is_better}
    showIndicators={true}
    disableInteraction={disabled}
    maxSelections={max_selections}
    bind:selectedIndices={selected}
    bind:highlightedIndex={highlighted}
  />
  <RadarChart
    indicatorNames={names}
    {values}
    maxSelections={max_selections}
    bind:selectedIndices={selected}
    bind:highlightedIndex={highlighted}
  />
</div>
