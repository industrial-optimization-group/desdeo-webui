<!--@component
    @description 
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

  let series = [];

  //
  let dataSet = [["Solution", ...names]];
  for (let i = 0; i < values.length; i++) {
    let newArr = ["Solution " + (i + 1)];
    newArr.push(...values[i]);
    dataSet.push(newArr);
    series.push({ type: "bar" });
  }
  console.log(dataSet);
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
        // show: false,
        // data: names,
      },
      yAxis: {
        type: "value",
      },

      // series:
      // [
      // {
      //   name: "test1",
      //   data: seriesData,
      //   type: "bar",
      //   emphasis: {
      //     focus: "series",
      //   },
      //   seriesLayoutBy: "row",
      // },
      // {
      //   name: "test2",
      //   data: [6,7,8],
      //   type: "bar",emphasis: {
      //     focus: "series",
      //   }
      //   // seriesLayoutBy: "row",
      // },
      // {
      //   name: "test3",
      //   data: [8,8,8],
      //   type: "bar",emphasis: {
      //     focus: "series",
      //   }
      // seriesLayoutBy: "row",
      // },
      // ],

      dataset: {
        // dimensions: names,
        source: dataSet,
        // sourceHeader: "auto",
      },
      series: series,
    };
    // let chart: echarts.EChartsType = createChart(id, option);
    let chart = createChart(id, option);

    chart.on("mouseover", (params) => {
      console.log(params);
      console.log(params.seriesIndex);
      console.log(params.dataIndex);
      chart.dispatchAction({
        type: "downplay",
        seriesIndex: [0, 1, 2],
        dataIndex: [0, 1, 2],
      });
      chart.dispatchAction({
        type: "highlight",
        seriesIndex: params.seriesIndex,
        dataIndex: [0, 1, 2],
      });
      chart.setOption({
        emphasis: {
          itemStyle: {
            color: "red",
          },
        },
      });
    });
    chart.on("mouseout", () => {
      chart.dispatchAction({
        type: "downplay",
        seriesIndex: [0, 1, 2],
        dataIndex: [0, 1, 2],
      });
      // chart.dispatchAction({
      //   type: "highlight",
      //   seriesIndex: 0,
      //   dataIndex: params.dataIndex,
      // });
    });
  });
</script>

<div {id} style="width: 100vh; height: 50vh;" />
