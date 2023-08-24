<script lang="ts" context="module">
  export type Point = number[];
</script>

<script lang="ts">
  import { TabGroup, Tab } from "@skeletonlabs/skeleton";

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

  //
  // TODO: Should we also allow multiple highlighted values? (This is for
  // future; don't worry about it now.)
  //

  // Import the visualizations here.
  import ParallelCoordinatePlotBase from "$lib/components/visual/visualization/props-linking/ParallelCoordinatePlotBase.svelte";
  import RadarChart from "$lib/components/visual/visualization/props-linking/RadarChart.svelte";
  // import Petals from "$lib/components/visual/visualization/props-linking/MultiplePetalCharts.svelte";
  import MultipleBarCharts from "$lib/components/visual/visualization/props-linking/MultipleBarCharts.svelte";
  import MultiplePetalCharts from "$lib/components/visual/visualization/props-linking/MultiplePetalCharts.svelte";

  // As a temporary solution, add the color palette here as a constant and pass
  // it to the components.

  // Do the same here for any other stuff that currently uses stores.

  let tab = 0;
</script>

<TabGroup class="flex h-full flex-col " regionPanel=" flex flex-col grow">
  <Tab bind:group={tab} name="tab1" value={0}>Parallel Axis Plot</Tab>
  <Tab bind:group={tab} name="tab2" value={1}>Spider Plot</Tab>
  <Tab bind:group={tab} name="tab3" value={2}>Petal and bar plots</Tab>
  <Tab bind:group={tab} name="tab4" value={3}>Bar plots</Tab>

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
    {:else if tab === 2}
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
      <MultipleBarCharts
        {values}
        maxSelections={max_selections}
        bind:selectedIndices={selected}
        bind:highlightedIndex={highlighted}
        axisNames={names}
      />
      <MultiplePetalCharts
        {values}
        maxSelections={max_selections}
        bind:selectedIndices={selected}
        bind:highlightedIndex={highlighted}
        axisNames={names}
      />
    {/if}
  </svelte:fragment>
</TabGroup>
