<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";

  export let title: string;
  export let data: (string | number)[][];

  onMount(() => {
    const chart = echarts.init(
      document.getElementById("chart") as HTMLCanvasElement
    );
    let option: echarts.EChartsOption = {
      title: {
        text: title,
      },
      parallelAxis: [
        { dim: 0, name: "Price" },
        { dim: 1, name: "Net Weight" },
        { dim: 2, name: "Amount" },
        {
          dim: 3,
          name: "Score",
          type: "category",
          data: ["Excellent", "Good", "OK", "Bad"],
        },
      ],
      series: {
        type: "parallel",
        lineStyle: {
          width: 4,
        },
        data: data,
      },
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
