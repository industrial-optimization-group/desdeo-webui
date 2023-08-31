<!--@component
    @description This component creates multiple bar charts in one component and behaves in the same manner as other components that take multiple solutions as props. It can be used to compare multiple solutions and their objectives.

    @prop {string[]} colors - The colors of the bars. If not given, all bars will be blue.
    @prop {number[][]} values - The values of the solutions. Each solution is an array of numbers.
    @prop {string[]} names - The names of the axis (objectives).
    @prop {number[]} selectedIndices - The indices of the selected solutions.
    @prop {number} highlightedIndex - The index of the highlighted solution.
    @prop {number} maxSelections - The maximum number of selected solutions.
    @prop {boolean} asRow - If true, the bar charts will be displayed as a row. If false, they will be displayed as a column.
    @prop {boolean} disableAnimation - If true, the animation of the bar charts will be disabled.
    @prop {string} aspect - The aspect ratio of the div container, which contains all charts.
    @prop {boolean[]} lowerIsBetter - An array of boolean values indicating whether lower values are better for each data point (In MOO if the objective is to be minimized or maximized).
-->

<script lang="ts">
  import type * as echarts from "echarts";
  import {
    handleSelectionChange,
    handleHighlightChange,
  } from "$lib/components/visual/helperFunctions";
  import BarChart from "./BarChart.svelte";

  /** The colors to use for the charts. */
  export let colors: string[] = [];

  /** The values to use for the charts. */
  export let values: number[][];

  /** The names to use for the individual bars (objective names). */
  export let names: string[] = [];

  /** The indices of the selected items in the charts. */
  export let selectedIndices: number[] = [];

  /** The index of the highlighted item in the charts. */
  export let highlightedIndex: number | undefined = undefined;

  /** The maximum number of items that can be selected in the charts. */
  export let maxSelections: number | undefined = undefined;

  /**
   * If true, the bar charts will be displayed as a row. If false, they will be
   * displayed as a column.
   */
  export let asRow = true;

  /** If true, the animation of the bar charts will be disabled. */
  export let disableAnimation: boolean | undefined = undefined;

  /** The aspect ratio of the div container, which contains all charts. */
  export let aspect: string | undefined = "aspect-[5/3]";

  /**
   * An array of boolean values indicating whether lower values are better for
   * each data point (In MOO if the objective is to be minimized or maximized).
   */
  export let lowerIsBetter: boolean[] | undefined = undefined;

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

<div
  class="multi {aspect}"
  style="--flex-direction:{asRow ? 'row' : 'column'};"
>
  {#each values as objectiveValues, i}
    <BarChart
      title={"Solution " + (i + 1)}
      values={objectiveValues}
      {names}
      bind:selectedIndices
      bind:highlightedIndex
      componentIndex={i}
      {colors}
      {disableAnimation}
      {lowerIsBetter}
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
