<!--@component
    @description Makes a radar chart using the ECharts library.
-->

<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";

  export let names: string[];
  export let values: number[][];

  let indObjects: { name: string }[] = [];
  names.forEach((name) => {
    indObjects.push({ name: name });
  });
  let seriesData: { value: number[]; name: string }[] = [];
  for (let i = 0; i < values.length; i++) {
    seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
  }

  onMount(() => {
    const chart = echarts.init(
      document.getElementById("RadarChart") as HTMLCanvasElement
    );

    const option = {
      title: {
        text: "Radar Chart",
      },
      tooltip: {},
      // legend: {
      //     data: ["Sales"]
      // },
      radar: {
        shape: "circle",
        indicator: indObjects,
      },
      series: [
        {
          symbol: "none",
          selectedMode: "",
          select: {
            disabled: false,
            itemStyle: {
              color: "blue",
              opacity: 0.75,
            },
          },
          // name: "Sales",
          type: "radar",
          // areaStyle: {color: "blue", opacity: 0.35},
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

    // Add a click event listener to the chart
    chart.on("click", (params) => {
      // Check if a series is selected
      // if (params.seriesIndex >= 0) {
      // Get the index of the selected series
      const selectedSeriesIndex = params.seriesIndex;
      // Toggle the selection of the selected series
      chart.dispatchAction({
        type: "toggleSelect",
        seriesIndex: selectedSeriesIndex,
      });
      // }
    });
    chart.on("selectchanged", (params) => {
      console.log(params);
    });
    chart.setOption(option);
  });
</script>

<div id="RadarChart" />

<style>
  #RadarChart {
    width: 100vw;
    height: 70vh;
  }
</style>
