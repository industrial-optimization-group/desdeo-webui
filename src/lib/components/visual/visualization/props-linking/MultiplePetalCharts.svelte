<!--@component
    @description Makes a radar chart using the ECharts library.
-->

<script lang="ts">
  import type * as echarts from "echarts";
  // import { onDestroy } from "svelte";
  // import { chartStore } from "$lib/components/visual/chartStore";
  import {
    handleSelectionChange,
    handleHighlightChange,
  } from "$lib/components/visual/helperFunctions";
  import PetalAsPolar from "./PetalAsPolar.svelte";

  export let colors: string[] = [];
  export let values: number[][];
  // export let minimize: boolean[];
  // export let showIndicators = false;
  export let indicatorNames: string[] = []; // At the moment breaks the graphics if not given the same amount as values (objectives/axis)
  export let selectedIndices: number[] = [];
  export let highlightedIndex: number | undefined = undefined;
  export let maxSelections: number | undefined = undefined;
  export let asRow = true;
  // export let data: SolutionData;

  let chart: echarts.EChartsType;
  $: if (selectedIndices) {
    if (chart) {
      handleSelectionChange(chart, selectedIndices, maxSelections);
    }
  }

  $: {
    if (chart) {
      handleHighlightChange(chart, highlightedIndex);
    }
  }

  // const names: string[] = data.names;
  // const values: number[][] = data.values;

  // Create the indicator objects for the radar chart.
  let indObjects: { name: string }[] = [];
  indicatorNames.forEach((name) => {
    indObjects.push({ name: name });
  });
  // Create the series data for the radar chart.
  let seriesData: { value: number[]; name: string }[] = [];
  for (let i = 0; i < values.length; i++) {
    seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
  }
</script>

<div class="multi" style="--flex-direction:{asRow ? 'row' : 'column'}">
  {#each values as value, i}
    <div style="height: 100%; width: 100%;">
      <PetalAsPolar
        title={"Solution " + (i + 1)}
        objectiveValues={value}
        {selectedIndices}
        {highlightedIndex}
        componentIndex={i}
        axisNames={indicatorNames}
        color={colors[i]}
      />
    </div>
  {/each}
</div>

<style>
  .multi {
    display: flex;
    flex-direction: var(--flex-direction);
    /* flex-wrap: wrap; */
    justify-content: center;
    height: 100%;
    widows: 100%;
  }
</style>
