<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";

  export let title: string;
  // export let data: (string | number)[][];
  export let names: string[];
  export let values: number[][];
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
      title: {
        text: title,
      },
      parallelAxis: nameAxis,
      series: series,
    };
    chart.setOption(option);
  });
</script>

<div id="chart" />

<style>
  #chart {
    width: 70vw;
    height: 70vh;
  }
</style>
