<!--@component
    @description This is a template for a component that uses ECharts. It is not meant to be used directly.
-->

<script lang="ts">
  import type * as echarts from "echarts";
  import { onMount } from "svelte";
  // import { onDestroy } from "svelte";
  // import { chartStore } from "./chartStore";
  import { createChart } from "./stores";
  import type { SolutionData } from "./types";

  // The properties that can be passed to the component.
  export let id: string;
  export let title: string;
  export let data: SolutionData;
  console.log(data);

  // Here you can write code to make the data suitable for the chart. For example:
  /* 
  const values: number[][] = data.values;
  let seriesData: { value: number[]; name: string }[] = [];
  for (let i = 0; i < values.length; i++) {
    seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
  } */

  // The chart will be created when the component is mounted. This is done to ensure that the div element exists.
  onMount(() => {
    // Create the option object for the whole chart. This example creates a basic bar chart.
    const option: echarts.EChartOption = {
      title: {
        text: title,
      },
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: [120, 200, 150, 80, 70, 110, 130],
          type: "bar",
        },
      ],
    };
    createChart(id, option);
    // You can also assign the created chart to a variable if you want to use it later.
    /* const chart: echarts.EChartsType = createChart(id, option);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
      }); */
  });
</script>

<!--The div where the chart will be rendered. Must have width and height values for the chart to show.-->
<div {id} style="width: 100vh; height: 50vh;" />
