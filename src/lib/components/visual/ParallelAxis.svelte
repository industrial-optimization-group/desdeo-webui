<!--@component
  Creates a parallel axis chart using the ECharts library. As input, it takes a
  title, the names of the axes, and the values for each axis. 
  
  @param {string} id - The id of the div element that will contain the chart.
  @param {string} title - The title of the chart.
  @param {SolutionData} data - The data for the chart.
-->
<script lang="ts">
  // import type * as echarts from "echarts";
  import { onMount } from "svelte";
  // import { chartStore } from "./chartStore";
  import { createChart } from "./chartStore";
  import type { SolutionData } from "./types";

  export let id: string;
  export let title: string;
  export let data: SolutionData;

  const names: string[] = data.names;
  const values: number[][] = data.values;

  const selectedLineStyle = {
    width: 7,
    opacity: 1,
  };
  const lineStyle = {
    width: 3.5,
    opacity: 0.6,
  };

  console.log(data);

  onMount(() => {
    // Creates the lines on the chart as series data.
    let seriesData: { value: number[]; name: string }[] = [];
    for (let i = 0; i < values.length; i++) {
      seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
    }

    //  Creates the names for the axes as a parallelAxis component.
    let nameAxis: object[] = [];
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      let nameObj = {
        dim: i,
        name: name,
      };
      nameAxis.push(nameObj);
    }

    // Create the option object for the whole chart.
    const option = {
      title: {
        text: title,
      },
      tooltip: {
        formatter: function (params) {
          let result = params.name + "<br>";
          for (let i = 0; i < params.data.value.length; i++) {
            result += params.data.value[i] + "<br>";
          }
          return result;
        },
      },
      parallelAxis: nameAxis,
      brush: {
        brushMode: "multiple",
        throttleType: "debounce",
        throttleDelay: 300,
      },
      series: [
        {
          type: "parallel",
          lineStyle: lineStyle,
          emphasis: {
            lineStyle: selectedLineStyle,
          },
          data: seriesData,
        },
      ],
    };

    // let chart: echarts.EChartsType = createChart(id, option);
    createChart(id, option);
  });
</script>

<div {id} style="width: 100vh; height: 40vh;" />
