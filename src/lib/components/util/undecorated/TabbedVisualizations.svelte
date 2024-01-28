<!--
@component
A component for showing visualizations in tabs.

NOTE: The user of the component is responsible for verifying that `names`,
`values`, `lower_bounds`, `upper_bounds` and `lower_is_better` have the same
length.
-->
<script lang="ts" context="module">
  export type Point = number[];
</script>

<script lang="ts">
  import { TabGroup, Tab } from "@skeletonlabs/skeleton";
  import { transform_bounds } from "$lib/components/util/util";

  export let names: string[] | undefined = undefined;
  export let values: Point[];
  export let lower_bounds: number[];
  export let upper_bounds: number[];
  export let lower_is_better: boolean[];
  export let selected: number[] = [];
  export let max_selections: number | undefined = undefined;
  export let highlighted: number | undefined = undefined;
  export let tab = 0;
  export let disabled = false;

  $: bounds = transform_bounds(lower_bounds, upper_bounds);

  // Import the visualizations here.
  import ParallelCoordinatePlotBase from "$lib/components/visual/visualization/props-linking/ParallelCoordinatePlot.svelte";
  import RadarChart from "$lib/components/visual/visualization/props-linking/RadarChart.svelte";
  import MultiMiniBarChart from "$lib/components/visual/visualization/props-linking/MultiMiniBarChart.svelte";
  // import Petals from "$lib/components/visual/visualization/props-linking/MultiplePetalCharts.svelte";
</script>

<TabGroup>
  <Tab bind:group={tab} name="tab1" value={0}>Parallel Coordinate Plot</Tab>
  <Tab bind:group={tab} name="tab2" value={1}>Radar Chart</Tab>
  <Tab bind:group={tab} name="tab6" value={2}>Mini NIMBUS</Tab>
  <Tab bind:group={tab} name="tab5" value={3}>All</Tab>

  <svelte:fragment slot="panel">
    {#if tab === 0}
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
    {:else if tab === 1}
      <RadarChart
        indicatorNames={names}
        {values}
        maxSelections={max_selections}
        bind:selectedIndices={selected}
        bind:highlightedIndex={highlighted}
      />
    {:else if tab === 2}
      <MultiMiniBarChart
        solutions={values}
        lowerBounds={lower_bounds}
        upperBounds={upper_bounds}
        lowerIsBetter={lower_is_better}
        bind:selectedIndices={selected}
      />
    {:else if tab === 3}
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
      <MultiMiniBarChart
        solutions={values}
        lowerBounds={lower_bounds}
        upperBounds={upper_bounds}
        lowerIsBetter={lower_is_better}
        bind:selectedIndices={selected}
      />
    {/if}
  </svelte:fragment>
</TabGroup>
