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

  // let charts = $chartStore;

  let newSeriesObjects = [];
  let subTexts = [{ text: title }];

  // Change values of "values" to be positive with the map function.
  let valuesPositive = values.map((row) => row.map((value) => Math.abs(value)));

  // Transpose values matrix.
  // One liner from https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
  let valuesTransposed = valuesPositive[0].map((col, i) =>
    valuesPositive.map((row) => row[i])
  );
  for (let i = 0; i < valuesTransposed.length; i++) {
    const row = valuesTransposed[i];
    let petals = [];
    for (let j = 0; j < row.length; j++) {
      const value = row[j];
      petals.push({ value: value, name: "solution " + (j + 1) });
    }
    newSeriesObjects.push(
      {
        name: names[i],
        type: "pie",
        radius: 70,
        roseType: "area",
        itemStyle: {
          // borderWidth: 3,
          // borderColor: 'gray'
        },
        center: [((i + 0.5) / valuesTransposed.length) * 100 + "%", "50%"],
        data: petals,
      },
      // A circle for showing the lines between petals and border line.
      {
        type: "pie",
        radius: 70,
        tooltip: {
          show: false,
        },
        roseType: "area",
        itemStyle: {
          borderWidth: 1,
          borderColor: "gray",
          color: "transparent",
        },
        center: [((i + 0.5) / valuesTransposed.length) * 100 + "%", "50%"],
        // To be under the petals when clicking.
        z: 1,
        silent: true,
        label: {
          show: false,
        },
        data: [...Array(petals.length).fill(1)],
        // showEmptyCircle: true,
        // emptyCircleStyle: {
        //   borderWidth: 3,
        //   borderColor: '#235894'
        // },
      }
    );

    subTexts.push({
      subtext: names[i],
      left: ((i + 0.5) / valuesTransposed.length) * 100 + "%",
      top: "20%",
      textAlign: "center",
    });
  }

  onMount(() => {
    // Create the option object for the whole chart.
    const option = {
      title: subTexts,
      tooltip: {},
      aria: {},
      series: newSeriesObjects,
    };
    // let chart: echarts.EChartsType = createChart(id, option);
    createChart(id, option);
  });
</script>

<div {id} style="width: 100vh; height: 50vh;" />
