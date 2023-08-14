<!--@component
    @description Makes a radar chart using the ECharts library.
-->

<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  // import { onDestroy } from "svelte";
  // import { chartStore } from "./chartStore";
  import { selectedLineStyle } from "../stores";
  import {
    handleClickSelection,
    handleSelectionChange,
  } from "../helperFunctions";

  export let values: number[][];
  // export let minimize: boolean[];
  // export let showIndicators = false;
  export let indicatorNames: string[] = []; // At the moment breaks the graphics if not given the same amount as values (objectives/axis)
  export let selectedIndices: number[] = [];
  // export let data: SolutionData;

  let chartDiv: HTMLDivElement;
  let chart: echarts.EChartsType;
  $: if (selectedIndices) {
    if (chart) {
      handleSelectionChange(chart, selectedIndices);
    }
  }

  // const names: string[] = data.names;
  // const values: number[][] = data.values;

  // Create the indicator objects for the radar chart.
  let indObjects: { name: string }[] = [];
  indicatorNames.forEach((name) => {
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
      tooltip: {},
      radar: {
        shape: "circle",
        indicator: indObjects,
      },
      series: [
        {
          symbol: "none",
          type: "radar",
          selectedMode: "multiple",
          select: {
            lineStyle: selectedLineStyle,
          },
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
    // createChart(id, option);
    chart = echarts.init(chartDiv, "", { renderer: "svg" });
    chart.setOption(option);
    chart.on(
      "click",
      function (params: {
        dataIndex: number;
        componentType: string;
        seriesIndex: number;
      }) {
        console.log(params);
        selectedIndices = handleClickSelection(params, selectedIndices);
      }
    );
  });
</script>

<div style="width: 100vh; height: 50vh;" bind:this={chartDiv} />
