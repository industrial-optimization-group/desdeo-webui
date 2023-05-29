<!--@component
  Creates a parallel axis chart using the ECharts library. As input, it takes a
  title, the names of the axes, and the values for each axis. It outputs the
  selected solution, which is an array of numbers, where each number is the
  value of the axis at that index. The selected solution is highlighted on the
  chart.

  @param {string} title - The title of the chart.
  @param {string[]} names - The names of the axes.
  @param {number[][]} values - The values for each axis.
  @param {number[]} solution - The selected solution.
  
-->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";

  export let title: string;
  // export let data: (string | number)[][];
  export let names: string[];
  export let values: number[][];
  export let solutions: number[][];
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

  let series: echarts.ParallelSeriesOption[] = [];
  let nameAxis: object[] = [];

  let selectedLineStyle = {
    width: 7,
    opacity: 1,
  };
  let lineStyle = {
    width: 3.5,
    opacity: 0.6,
  };

  onMount(() => {
    const chart = echarts.init(
      document.getElementById("chart") as HTMLCanvasElement
    );

    // Creates the lines on the chart as a series component.
    values.forEach((valueSet) => {
      let valueObj: echarts.ParallelSeriesOption = {
        type: "parallel",
        selectedMode: "multiple",
        select: {
          disabled: false,
        },
        data: [valueSet],
        lineStyle: lineStyle,
        emphasis: {
          lineStyle: selectedLineStyle,
        },
      };
      series.push(valueObj);
    });

    //  Creates the names for the axes as a parallelAxis component.
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      let nameObj = {
        dim: i,
        name: name,
      };
      nameAxis.push(nameObj);
    }

    // Create the option object for the whole chart.
    let option: echarts.EChartsOption = {
      title: {
        text: title,
      },
      parallelAxis: nameAxis,
      series: series,
    };
    chart.setOption(option);

    /**
     * This function updates the selected solution to the clicked data point and
     * highlights the corresponding series (solution) on the chart.
     */
    chart.on("selectchanged", (params) => {
      let selectedSeriesIndex = params.fromActionPayload.seriesIndex;
      const selectedNumbers =
        chart.getOption().series[selectedSeriesIndex].data[0];
      console.log(params);
      if (params.fromAction == "select") {
        solutions.push(selectedNumbers);
        chart.dispatchAction({
          type: "highlight",
          seriesIndex: selectedSeriesIndex,
        });
      } else {
        // Find the index in the solutions array of the solution that was deselected and remove it from the array.
        let solutionIndex = solutions.findIndex(
          (element) => element.toString() == selectedNumbers.toString()
        );
        solutions.splice(solutionIndex, 1);
        chart.dispatchAction({
          type: "downplay",
          seriesIndex: selectedSeriesIndex,
        });
      }
      solutions = solutions;
    });
  });
</script>

<div id="chart" />

<style>
  #chart {
    width: 70vw;
    height: 70vh;
  }
</style>
