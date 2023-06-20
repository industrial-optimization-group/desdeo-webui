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
  import { createChart, updateChart } from "./chartStore";
  import type { SolutionData } from "./types";
  import type { EChartOption } from "echarts";
  import { writable } from "svelte/store";

  export let id: string;
  export let title: string;
  export let data: SolutionData;
  // export let callback: (i1: number, i2: number) => void;

  export const chartOption = writable<EChartOption>(undefined);

  //const names: string[] = data.names;
  //const values: number[][] = data.values;

  const selectedLineStyle = {
    width: 7,
    opacity: 1,
  };
  const lineStyle = {
    width: 3.5,
    opacity: 0.6,
  };

  function swapAxes(index1: number, index2: number) {
    console.log(index1, index2);

    //console.log(1, data)
    const newData = { ...data };

    console.log(1, data.names);

    newData.names = rearrangeNames(index1, index2);
    newData.values = rearrangeValues(index1, index2);
    data = newData;

    console.log(2, data.names);

    updateChart(id, createOption(data.names, data.values, true));
    //chartOption.set(createOption(data.names, data.values, false));
  }

  function rearrangeNames(index1: number, index2: number) {
    const newNames = [...data.names];
    const temp = newNames[index1];
    newNames[index1] = newNames[index2];
    newNames[index2] = temp;
    return newNames;
  }

  function rearrangeValues(index1: number, index2: number) {
    const newValues = [...data.values];

    for (const solution of newValues) {
      const temp = solution[index1];
      solution[index1] = solution[index2];
      solution[index2] = temp;
    }

    /* const temp = newValues[index1];
    newValues[index1] = newValues[index2];
    newValues[index2] = temp; */

    return newValues;
  }

  function createOption(
    names: string[],
    values: number[][],
    initialize: boolean
  ): EChartOption {
    // Creates the lines on the chart as series data.
    let seriesData: { value: number[]; name: string }[] = [];
    for (let i = 0; i < values.length; i++) {
      seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
    }

    //console.log(seriesData)

    //  Creates the names for the axes as a parallelAxis component.
    const nameAxis: object[] = [];

    //console.log("NEW NAMES INIT", nameAxis)

    for (let i = 0; i < names.length; i++) {
      let nameObj = {
        dim: i,
        name: names[i],
      };
      nameAxis.push(nameObj);
    }

    //console.log("NEW NAMES INIT", nameAxis)

    //console.log(nameAxis)

    // Create the option object for the whole chart.
    return {
      title: {
        text: title,
      },
      tooltip: {
        formatter: function (params) {
          //console.log(params)

          let result = params.name + "<br>";

          for (let i = 0; i < params.data.value.length; i++) {
            result += params.data.value[i] + "<br>";
          }
          return result;
        },
      },
      parallelAxis: nameAxis,
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
      graphic: initialize
        ? nameAxis.map((axis, index) => ({
            type: "group",
            //left: 100,
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

                      //callback(index, index - 1)
                    },
                    position: [82 + index * 405 - 15, 0],
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
                      //console.log(e.event)

                      swapAxes(index, index + 1);
                      //e.event.preventDefault()
                      //callback(index, index + 1)
                    },
                    position: [82 + index * 405 + 15, 0],
                  }
                : undefined,
            ],
          }))
        : undefined,
    };
  }

  onMount(() => {
    // let chart: echarts.EChartsType = createChart(id, option);

    const chart = createChart(id, createOption(data.names, data.values, true));

    chartOption.subscribe((option) => {
      if (option) {
        chart.setOption(option);
      }
    });
  });
</script>

<div {id} style="width: 100vh; height: 40vh;" />
