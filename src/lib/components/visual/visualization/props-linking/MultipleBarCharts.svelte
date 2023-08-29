<!--@component
    @description This component creates multiple petal charts in one component and behaves in the same manner as other components that take multiple solutions as props. It can be used to compare multiple solutions and their objectives.

    @prop {string[]} colors - The colors of the petals. If not given, all petals will be blue.
    @prop {number[][]} values - The values of the solutions. Each solution is an array of numbers.
    @prop {string[]} axisNames - The names of the axis (objectives).
    @prop {number[]} selectedIndices - The indices of the selected solutions.
    @prop {number} highlightedIndex - The index of the highlighted solution.
    @prop {number} maxSelections - The maximum number of selected solutions.
    @prop {boolean} asRow - If true, the petal charts will be displayed as a row. If false, they will be displayed as a column.
    
    
-->
<!-- TODO: Implement lower is better prop -->
<!-- TODO: Fix clickin on component doesn't update selected value to other components (handleClickSelection might be the solution)-->

<script lang="ts">
  import type * as echarts from "echarts";
  import {
    handleSelectionChange,
    handleHighlightChange,
  } from "$lib/components/visual/helperFunctions";
  import BarChart from "./BarChart.svelte";

  export let colors: string[] = [];
  export let values: number[][];
  export let axisNames: string[] = [];
  export let selectedIndices: number[] = [];
  export let highlightedIndex: number | undefined = undefined;
  export let maxSelections: number | undefined = undefined;
  export let asRow = true;
  export let disableAnimation: boolean | undefined = undefined;
  export let height: number | undefined = 40;

  //TODO: Check if these are needed in this component
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
  // let count = values[0].length;
  // let aspect = "aspect-[1/" + count + "]";
</script>

<div class="multi" style="--flex-direction:{asRow ? 'row' : 'column'};">
  {#each values as objectiveValues, i}
    <BarChart
      title={"Solution " + (i + 1)}
      values={objectiveValues}
      {axisNames}
      {selectedIndices}
      {highlightedIndex}
      componentIndex={i}
      {colors}
      {disableAnimation}
      {height}
    />
    <!-- {aspect} -->
    <!-- {axisNames} -->
  {/each}
</div>

<style>
  .multi {
    display: flex;
    flex-direction: var(--flex-direction);
    /* flex-wrap: wrap; */
    justify-content: center;
    /* height: 100%; */
    /* width: 100%; */
  }
</style>
