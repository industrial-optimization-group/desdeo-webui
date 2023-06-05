<!--@component
    @description Makes a radar chart using the ECharts library.
-->

<script lang="ts">
  // import type * as echarts from "echarts";
  import { onMount } from "svelte";
  // import { onDestroy } from "svelte";
  import { chartStore } from "./chartStore";
  import { createChart } from "./chartStore";

  export let names: string[];
  export let values: number[][];
  export let id: string;
  // let testContent = "test content"
  let charts = $chartStore;

  let indObjects: { name: string }[] = [];
  names.forEach((name) => {
    indObjects.push({ name: name });
  });
  let seriesData: { value: number[]; name: string }[] = [];
  for (let i = 0; i < values.length; i++) {
    seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
  }

  onMount(() => {
    const option = {
      title: {
        text: "Radar Chart",
      },
      tooltip: {},
      radar: {
        shape: "circle",
        indicator: indObjects,
      },
      series: [
        {
          symbol: "none",
          selectedMode: "multiple",
          select: {
            disabled: false,
            itemStyle: {
              color: "blue",
              opacity: 0.75,
            },
          },
          type: "radar",
          emphasis: {
            // areaStyle: {
            //     color: "blue",
            //     opacity: 0.75
            // },
            lineStyle: {
              width: 5,
              opacity: 1,
            },
          },
          data: seriesData,
        },
      ],
    };

    createChart(id, option);
    // let chart: echarts.EChartsType = createChart(id, option);
    // Add a click event listener to the chart
    // chart.on("click", (params) => {
    //   // Check if a series is selected
    //   // if (params.seriesIndex >= 0) {
    //   // Get the index of the selected series
    //   const selectedSeriesIndex = params.seriesIndex;
    //   // Toggle the selection of the selected series
    //   chart.dispatchAction({
    //     type: "toggleSelect",
    //     seriesIndex: selectedSeriesIndex,
    //   });
    //   // }
    // });
    // chart.on("selectchanged", (params) => {
    //   console.log(params);
    // });
  });
</script>

{#if chartStore}
  <p>{charts}</p>
{/if}

<div {id} style="width: 100vh; height: 50vh;" />
