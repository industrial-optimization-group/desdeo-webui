<!--@component
  Creates a parallel axis chart using the ECharts library. As input, it takes a
  title, the names of the axes, and the values for each axis. 
  
  @param {string} id - The id of the div element that will contain the chart.
  @param {string} title - The title of the chart.
  @param {SolutionData} data - The data for the chart.
-->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  import { createChart, updateChart } from "./stores";
  // import type { SolutionData } from "./types";
  import type { EChartOption } from "echarts";

  export let id: string;
  export let title: string;
  // export let data: SolutionData;
  export let values: number[][];
  export let names: string[] = [];

  let data = { names: names, values: values };

  let option;
  $: if (values) {
    option = createOption(names, values);
    updateChart(id, option);
    data = { names: names, values: values };
  }

  const selectedLineStyle = {
    width: 7,
    opacity: 1,
  };
  const lineStyle = {
    width: 3.5,
    opacity: 0.6,
  };

  function swapAxes(index1: number, index2: number) {
    const newData = { ...data };

    newData.names = rearrangeNames(index1, index2);
    newData.values = rearrangeValues(index1, index2);
    data = newData;

    updateChart(id, createOption(data.names, data.values));
  }

  function rearrangeNames(index1: number, index2: number) {
    const newNames = [...data.names];
    if (newNames.length > 0) {
      const temp = newNames[index1];
      newNames[index1] = newNames[index2];
      newNames[index2] = temp;
      return newNames;
    }
    return newNames;
  }

  function rearrangeValues(index1: number, index2: number) {
    const newValues = [...data.values];

    for (const solution of newValues) {
      const temp = solution[index1];
      solution[index1] = solution[index2];
      solution[index2] = temp;
    }

    return newValues;
  }

  function createOption(names: string[], values: number[][]): EChartOption {
    // Creates the lines on the chart as series data.
    let seriesData: { value: number[]; name: string }[] = [];
    for (let i = 0; i < values.length; i++) {
      seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
    }

    //  Creates the names for the axes as a parallelAxis component.
    const nameAxis: object[] = [];
    if (names.length > 0) {
      for (let i = 0; i < names.length; i++) {
        let nameObj = {
          dim: i,
          name: names[i],
        };
        nameAxis.push(nameObj);
      }
    } else {
      for (let i = 0; i < values[0].length; i++) {
        let nameObj = {
          dim: i,
          name: "Objective " + (i + 1),
        };
        nameAxis.push(nameObj);
      }
    }

    let chart: echarts.ECharts | undefined;
    if (typeof document !== "undefined") {
      chart = echarts.getInstanceByDom(document.getElementById(id));
    } else {
      chart = undefined;
    }

    const graphicData = nameAxis.map((_, index) => ({
      type: "group",
      bottom: 20,
      children: [
        // Left arrow button
        index !== 0
          ? {
              type: "polygon",
              shape: {
                points: [
                  [-1, 15],
                  [-1, -15],
                  [-15, 0],
                ],
              },
              style: {
                fill: "#409EFF",
              },
              onclick: () => {
                swapAxes(index, index - 1);
              },
              /* Explanation of the code line below:
                // Gets the model of parallelAxis component, which has all the axes as an array.
                const model = chart.getModel().getComponent("parallelAxis");
                // Gets the axesLayot which has the position info of every parallel axes
                const axes = model.coordinateSystem._axesLayout
                // Gets the x-coordinate of the i:th axis 
                const xCoord = Object.values(axes)[index].position[0] 
                */
              x: chart
                ? Object.values(
                    chart.getModel().getComponent("parallelAxis")
                      .coordinateSystem._axesLayout
                  )[index].position[0]
                : 0,
            }
          : undefined,

        // Right arrow button
        index !== nameAxis.length - 1
          ? {
              type: "polygon",
              shape: {
                points: [
                  [1, 15],
                  [1, -15],
                  [15, 0],
                ],
              },
              style: {
                fill: "#409EFF",
              },
              onclick: () => {
                swapAxes(index, index + 1);
              },
              x: chart
                ? Object.values(
                    chart.getModel().getComponent("parallelAxis")
                      .coordinateSystem._axesLayout
                  )[index].position[0]
                : 0,
            }
          : undefined,
      ],
    }));

    // Create the option object for the whole chart.
    return {
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
      graphic: graphicData,
    };
  }
  onMount(() => {
    createChart(id, option);
    // updateChart(id, createOption(data.names, data.values));
  });
</script>

<div {id} style="width: 100vh; height: 40vh;" />
