<!--@component
  Creates a parallel axis chart using the ECharts library. As input, it takes a
  title, the names of the axes, and the values for each axis. It outputs the
  selected solution, which is an array of numbers, where each number is the
  value of the axis at that index. The selected solution is highlighted on the
  chart.

  @param {string} title - The title of the chart.
  @param {string[]} names - The names of the axes.
  @param {number[][]} values - The values for each axis.
  @param {number[]} solution - The selected solution.
  
-->
<script lang="ts">
  // import type * as echarts from "echarts";
  import { onMount } from "svelte";
  // import { chartStore } from "./chartStore";
  import { createChart } from "./chartStore";

  export let title: string;
  export let names: string[];
  export let values: number[][];
  export let id: string;

  // export let data: (string | number)[][];
  // export let solutions: number[][];
  //   export let dimensions: ({
  //     dim: number;
  //     name: string;
  //     type?: undefined;
  //     data?: undefined;
  // } | {
  //     dim: number;
  //     name: string;
  //     type: string;
  //     data: string[];
  // })[]

  // let series: echarts.ParallelSeriesOption[] = [];
  let nameAxis: object[] = [];

  let selectedLineStyle = {
    width: 7,
    opacity: 1,
  };
  let lineStyle = {
    width: 3.5,
    opacity: 0.6,
  };

  onMount(() => {
    // Creates the lines on the chart as series data.
    let seriesData: { value: number[]; name: string }[] = [];
    for (let i = 0; i < values.length; i++) {
      seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
    }

    //  Creates the names for the axes as a parallelAxis component.
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      let nameObj = {
        dim: i,
        name: name,
      };
      nameAxis.push(nameObj);
    }

    // Create the option object for the whole chart.
    const option = {
      title: {
        text: title,
      },
      tooltip: {
        formatter: function (params) {
          let result = params.name + "<br>";
          for (let i = 0; i < params.data.value.length; i++) {
            result += params.data.value[i] + "<br>";
          }
          return result;
        },
      },
      parallelAxis: nameAxis,
      series: [
        {
          type: "parallel",
          lineStyle: lineStyle,
          emphasis: {
            lineStyle: selectedLineStyle,
          },
          data: seriesData,
        },
      ],
    };

    // let chart: echarts.EChartsType = createChart(id, option);
    createChart(id, option);
  });
</script>

<div {id} style="width: 100vh; height: 40vh;" />
