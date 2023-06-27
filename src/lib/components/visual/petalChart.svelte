<!--@component
    @description Makes a petal chart using the ECharts library's pie option.
-->

<script lang="ts">
  // import type * as echarts from "echarts";
  import { onMount } from "svelte";
  // import { onDestroy } from "svelte";
  // import { chartStore } from "./chartStore";
  import { createChart } from "./stores";
  import type { SolutionData } from "./types";

  export let id: string;
  export let title: string;
  export let data: SolutionData;

  const names: string[] = data.names;
  const values: number[][] = data.values;

  let newSeriesObjects = [];
  let subTexts = [{ text: title }];
  // Change values of "values" to be positive with the map function.
  let valuesPositive = values.map((row) => row.map((value) => Math.abs(value)));
  let valuesTransposed = valuesPositive;
  // Transpose values matrix. One liner from https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
  // let valuesTransposed = valuesPositive[0].map((col, i) =>
  //   valuesPositive.map((row) => row[i])
  // );
  // Set the column names
  let dataSet = [["Solution", ...names]];
  for (let i = 0; i < valuesTransposed.length; i++) {
    let newRow = ["Solution" + (i + 1)];
    newRow.push(...valuesTransposed[i]);
    dataSet.push(newRow);

    newSeriesObjects.push(
      {
        name: names[i],
        type: "pie",
        radius: "30%",
        roseType: "area",
        center: [((i + 0.5) / valuesTransposed.length) * 100 + "%", "50%"],
        encode: {
          itemName: "Solution",
          value: names[i],
          tooltip: names[i],
        },
      },
      // A circle for showing the lines between petals and border line.
      {
        type: "pie",
        radius: "30%",
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
        data: [...Array(valuesTransposed.length).fill(1)],
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
      tooltip: {
        formatter: (params) => {
          return (
            params.name +
            "</br>" +
            "</br>" +
            params.seriesName +
            " value" +
            ": " +
            params.data[params.seriesIndex + 1] +
            "</br>" +
            "All values" +
            ": " +
            valuesPositive[params.dataIndex]
          );
        },
      },
      dataset: {
        source: dataSet,
      },
      series: newSeriesObjects,
    };
    // let chart: echarts.EChartsType = createChart(id, option);
    createChart(id, option);
  });
</script>

<div {id} style="width: 100vh; height: 50vh;" />
