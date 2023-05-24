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

  onMount(() => {
    const chart = echarts.init(
      document.getElementById("chart") as HTMLCanvasElement
    );
    let valueSeries: {
      type: string;
      data: number[][];
    }[] = [];

    console.log(values);
    values.forEach((valueSet) => {
      console.log(valueSet);
      let valueObj = {
        type: "parallel",
        data: [valueSet],
      };
      valueSeries.push(valueObj);
    });

    let nameAxis = [];
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      let nameObj = {
        dim: i,
        name: name,
      };
      nameAxis.push(nameObj);
    }

    console.log("valueseries:");
    console.log(valueSeries);

    let option: echarts.EChartsOption = {
      title: {
        text: title,
      },
      parallelAxis: nameAxis,
      series: valueSeries,
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
