<!--
@component
A component for showing visualizations in a 2-column layout.

NOTE: The user of the component is responsible for verifying that `names`,
`values`, `lower_bounds`, `upper_bounds` and `lower_is_better` have the same
length.
-->
<script lang="ts" context="module">
  export type Point = number[];
</script>

<script lang="ts">
  import { transform_bounds } from "$lib/components/util/util";
  import { colorPalette } from "$lib/components/visual/constants";
  import MultipleBarCharts from "$lib/components/visual/visualization/props-linking/MultipleBarCharts.svelte";
  import MultiplePetalCharts from "$lib/components/visual/visualization/props-linking/MultiplePetalCharts.svelte";

  export let names: string[] | undefined = undefined;
  export let values: Point[];
  export let lower_bounds: Point;
  export let upper_bounds: Point;
  export let lower_is_better: boolean[];
  export let selected: number[] = [];
  export let max_selections: number | undefined = undefined;
  export let highlighted: number | undefined = undefined;
  export let disabled = false;

  $: bounds = transform_bounds(lower_bounds, upper_bounds);

  // Import the visualizations here.
  import ParallelCoordinatePlotBase from "$lib/components/visual/visualization/props-linking/ParallelCoordinatePlot.svelte";
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
  <MultipleBarCharts
    {values}
    maxSelections={max_selections}
    bind:selectedIndices={selected}
    bind:highlightedIndex={highlighted}
    axisNames={names}
    colors={colorPalette}
  />
  <MultiplePetalCharts
    {values}
    maxSelections={max_selections}
    bind:selectedIndices={selected}
    bind:highlightedIndex={highlighted}
    axisNames={names}
    colors={colorPalette}
  />
</div>
