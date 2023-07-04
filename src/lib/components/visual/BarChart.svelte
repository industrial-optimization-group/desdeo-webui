<!--@component
    @description 
-->

<script lang="ts">
  import { onMount } from "svelte";
  // import { onDestroy } from "svelte";
  import { selectedSolutionsIndices } from "./stores";
  import { createChart } from "./stores";
  import type { SolutionData } from "./types";

  export let id: string;
  export let title: string;
  export let data: SolutionData;

  const names: string[] = data.names;
  const values: number[][] = data.values;

  let series = [];

  // Set the column names
  let dataSet = [["Solution", ...names]];
  for (let i = 0; i < values.length; i++) {
    let newRow = ["Solution " + (i + 1)];
    newRow.push(...values[i]);
    dataSet.push(newRow);
    series.push({ type: "bar" });
  }
  onMount(() => {
    // Create the option object for the whole chart.
    const option = {
      title: {
        text: title,
      },
      tooltip: {
        formatter: (params) => {
          let result = params.seriesName + "<br>";
          // +1 Because the first value in the list is the name of the objective.
          return result + "Value: " + params.data[params.seriesIndex + 1];
        },
      },
      xAxis: {
        type: "category",
      },
      yAxis: {
        type: "value",
      },
      dataset: {
        source: dataSet,
      },
      series: series,
    };
    let chart = createChart(id, option);
    let allValues = [...Array(values.length).keys()];
    chart.on("mouseover", (params) => {
      // console.log(params);
      // console.log(params.seriesIndex);
      // console.log(params.dataIndex);
      chart.dispatchAction({
        type: "downplay",
        seriesIndex: allValues,
        dataIndex: allValues,
      });
      chart.dispatchAction({
        type: "highlight",
        seriesIndex: params.seriesIndex,
        dataIndex: allValues,
      });
      // chart.setOption({
      //   emphasis: {
      //     itemStyle: {
      //       color: "red",
      //     },
      //   },
      // });
    });
    chart.on("mouseout", () => {
      chart.dispatchAction({
        type: "downplay",
        seriesIndex: allValues,
        dataIndex: allValues,
      });

      //TODO: make selectedIndices a store also.
      // console.log({ $selectedSolutionsIndices });
      chart.dispatchAction({
        type: "highlight",
        seriesIndex: allValues,
        // dataIndex: params.dataIndex,
        dataIndex: $selectedSolutionsIndices,
      });
    });
  });
</script>

<div {id} style="width: 100vh; height: 50vh;" />
