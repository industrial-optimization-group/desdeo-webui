<!--@component
    @description Visulize multiple solutions with mini bar chart, which look
    like NIMBUS classification component using the ECharts library.
-->
<!-- TODO: Values on the x-axis too close to each other -->
<script lang="ts">
  import { colorPalette } from "../../constants";
  import MiniBarChart from "./MiniBarChart.svelte";

  /** The colors to use for the chart. */
  export let colors: string[] = [];

  /** The values to use for the chart. */
  export let solutions: number[][];

  /** The lower bounds for each objective */
  export let lowerBounds: number[] = [];

  /** The upper bounds for each objective */
  export let upperBounds: number[] = [];

  /** The indices of the selected items in the chart. */
  export let selectedIndices: number[] = [];

  /**
   * The aspect ratio as a tailwind class for the div container, which contains
   * the chart.
   *
   * @example
   *   aspect - [5 / 3];
   */

  /**
   * An array of boolean values indicating whether lower values are better for
   * each data point (In MOO if the objective is to be minimized or maximized).
   */
  export let lowerIsBetter: boolean[] | undefined = undefined;

  if (colors === undefined || colors.length === 0) {
    colors = colorPalette;
  }
  $: console.log(selectedIndices);

  function handleClick(index: number) {
    if (selectedIndices.includes(index)) {
      selectedIndices = selectedIndices.filter((i) => i !== index);
    } else {
      selectedIndices = [...selectedIndices, index];
    }
  }
</script>

<section class="grid grid-cols-2 gap-4 md:grid-cols-3">
  {#each solutions as value, index}
    {#if selectedIndices.includes(index)}
      <button
        style="border-color: red; border-width: 3px;"
        on:click={() => handleClick(index)}
      >
        <MiniBarChart
          {colors}
          values={value}
          {lowerBounds}
          {upperBounds}
          {lowerIsBetter}
        />
      </button>
    {:else}
      <button
        style="border-color: black; border-width: 3px;"
        on:click={() => handleClick(index)}
      >
        <MiniBarChart
          {colors}
          values={value}
          {lowerBounds}
          {upperBounds}
          {lowerIsBetter}
        />
      </button>
    {/if}
  {/each}
</section>

<!-- height = {6/3} -->
