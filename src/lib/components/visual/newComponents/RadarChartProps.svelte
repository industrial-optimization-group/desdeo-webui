<!--@component
    @description Makes a radar chart using the ECharts library.
-->

<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  // import { onDestroy } from "svelte";
  // import { chartStore } from "./chartStore";
  import { selectedLineStyle } from "../stores";

  export let values: number[][];
  // export let minimize: boolean[];
  // export let showIndicators = false;
  export let names: string[] = []; // At the moment breaks the graphics if not given the same amount as values (objectives/axis)
  export let selectedIndices: number[] = [];
  // export let data: SolutionData;

  let chartDiv: HTMLDivElement;
  let chart: echarts.EChartsType;
  $: if (selectedIndices) {
    if (chart) {
      chart.dispatchAction({
        type: "unselect",
        seriesIndex: 0,
        dataIndex: chart.getModel().getSeries()[0].getSelectedDataIndices(),
      });
      chart.dispatchAction({
        type: "select",
        seriesIndex: 0,
        dataIndex: selectedIndices,
      });
      // Downplay all after selection, for selection to show
      chart.dispatchAction({
        type: "downplay",
        seriesIndex: 0,
      });
    }
  }

  // const names: string[] = data.names;
  // const values: number[][] = data.values;

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
        text: "title",
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
    chart.on("click", function (params) {
      console.log(params);
      // Check if selectedIndices already contains the index of the clicked solution
      if (selectedIndices.includes(params.dataIndex)) {
        // If it does, remove it from the array (to unselect it)
        selectedIndices.splice(selectedIndices.indexOf(params.dataIndex), 1);
      } else {
        // If it doesn't, add it to the array
        selectedIndices = [...selectedIndices, params.dataIndex];
      }

      selectedIndices = selectedIndices;
      if (params.componentType === "series") {
        console.log(params.seriesIndex);
        console.log(params.dataIndex);
        // selectedIndices = [params.dataIndex];
      }
    });
  });
</script>

<div style="width: 100vh; height: 50vh;" bind:this={chartDiv} />
