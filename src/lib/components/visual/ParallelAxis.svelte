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
  import * as echarts from "echarts";
  import { onMount } from "svelte";

  export let title: string;
  // export let data: (string | number)[][];
  export let names: string[];
  export let values: number[][];
  export let solution: number[];
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

  let series: echarts.ParallelSeriesOption[] = [];
  let nameAxis: object[] = [];
  let selectedLineStyle = {
    width: 5,
    opacity: 1,
  };

  onMount(() => {
    const chart = echarts.init(
      document.getElementById("chart") as HTMLCanvasElement
    );

    values.forEach((valueSet) => {
      let valueObj: echarts.ParallelSeriesOption = {
        type: "parallel",
        data: [valueSet],
        emphasis: {
          lineStyle: selectedLineStyle,
        },
      };
      series.push(valueObj);
    });

    // let nameAxis = [];
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      let nameObj = {
        dim: i,
        name: name,
      };
      nameAxis.push(nameObj);
    }

    let option: echarts.EChartsOption = {
      tooltip: {
        trigger: "item",
        // valueFormatter: value => value
      },
      title: {
        text: title,
      },
      parallelAxis: nameAxis,
      series: series,
    };
    chart.setOption(option);

    /**
     * This function updates the selected solution to the clicked data point and
     * highlights the corresponding series on the chart.
     */
    chart.on("click", (params) => {
      solution = params.data;
      chart.dispatchAction({
        type: "highlight",
        seriesIndex: params.componentIndex,
      });
    });
  });
</script>

<div id="chart" />

<style>
  #chart {
    width: 70vw;
    height: 70vh;
  }
</style>
