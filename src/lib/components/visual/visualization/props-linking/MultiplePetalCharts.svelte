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
  import PetalAsPolar from "./PetalAsPolar.svelte";

  /** The colors of the petals. If not given, all petals will be blue. */
  export let colors: string[] = [];

  /** The values of the solutions. Each solution is an array of numbers. */
  export let values: number[][];

  /** The names of the axis (objectives). */
  export let axisNames: string[] = [];

  /** The indices of the selected solutions. */
  export let selectedIndices: number[] = [];

  /** The index of the highlighted solution. */
  export let highlightedIndex: number | undefined = undefined;

  /** The maximum number of selected solutions. */
  export let maxSelections: number | undefined = undefined;

  /**
   * If true, the petal charts will be displayed as a row. If false, they will
   * be displayed as a column.
   */
  export let asRow = true;

  /** If true, the animation of the petal charts will be disabled. */
  export let disableAnimation: boolean | undefined = undefined;

  /** The aspect ratio of the div container, which contains all charts. */
  export let aspect: string | undefined = "aspect-[5/3]";

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
</script>

<div class="multi {aspect}" style="--flex-direction:{asRow ? 'row' : 'column'}">
  {#each values as value, i}
    <PetalAsPolar
      title={"Solution " + (i + 1)}
      values={value}
      bind:selectedIndices
      bind:highlightedIndex
      componentIndex={i}
      names={axisNames}
      {colors}
      {disableAnimation}
    />
  {/each}
</div>

<style>
  .multi {
    display: flex;
    flex-direction: var(--flex-direction);
    /* flex-wrap: wrap; */
    justify-content: center;
    /* height: 100%; */
    /* widows: 100%; */
  }
</style>
