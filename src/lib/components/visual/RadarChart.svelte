<!--@component
    @description Makes a radar chart using the ECharts library.
-->

<script lang="ts">
  // import type * as echarts from "echarts";
  import { onMount } from "svelte";
  // import { onDestroy } from "svelte";
  // import { chartStore } from "./chartStore";
  import { createChart } from "./chartStore";
  import type { SolutionData } from "./types";

  export let id: string;
  export let title: string;
  export let data: SolutionData;

  const names: string[] = data.names;
  const values: number[][] = data.values;

  // Create the indicator objects for the radar chart.
  let indObjects: { name: string }[] = [];
  names.forEach((name) => {
    indObjects.push({ name: name });
  });
  // Create the series data for the radar chart.
  let seriesData: { value: number[]; name: string }[] = [];
  for (let i = 0; i < values.length; i++) {
    seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
  }

  onMount(() => {
    // Create the option object for the whole chart.
    const option = {
      title: {
        text: title,
      },
      tooltip: {},
      radar: {
        shape: "circle",
        indicator: indObjects,
      },
      series: [
        {
          symbol: "none",
          type: "radar",
          emphasis: {
            lineStyle: {
              width: 5,
              opacity: 1,
            },
          },
          data: seriesData,
        },
      ],
    };
    // let chart: echarts.EChartsType = createChart(id, option);
    createChart(id, option);
  });
</script>

<div {id} style="width: 100vh; height: 50vh;" />
