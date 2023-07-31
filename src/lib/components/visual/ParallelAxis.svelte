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
  import { colorPalette } from "./stores";
  // import type { SolutionData } from "./types";
  import type { Ranges } from "./types";
  import type { EChartOption } from "echarts";

  // export let data: SolutionData;
  export let values: number[][];
  export let minimize: boolean[];
  export let ranges: Ranges[] | undefined = undefined;
  export let names: string[] = [];
  export let selectedIndices: number[] = [];
  let chartDiv: HTMLDivElement;
  let chart: echarts.ECharts | undefined;
  let option: echarts.EChartOption;

  $: data = { names: names, values: values };
  $: if (selectedIndices) {
    if (chart) {
      chart.dispatchAction({
        type: "downplay",
        seriesIndex: 0,
      });
      chart.dispatchAction({
        type: "highlight",
        seriesIndex: 0,
        dataIndex: selectedIndices,
      });
    }
  }
  $: if (values) {
    if (!chart) {
      option = createOption(names, values);
      chart?.setOption(option, true, false);
      // data = { names: names, values: values };
    } else {
      option = createOption(names, values);
      chart?.setOption(option, true, false);
    }
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

    chart?.setOption(createOption(newData.names, newData.values), true, false);
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

  function addMinMaxIndicators() {
    function getY(min: boolean, index: number) {
      if (min) {
        return Object.values(
          chart.getModel().getComponent("parallelAxis").coordinateSystem
            ._axesLayout
        )[index].position[1];
      } else {
        return chart
          .getModel()
          .getComponent("parallelAxis")
          .coordinateSystem.getRect().y;
      }
    }
    const graphicData = minimize.map((min, index) => ({
      // Test background min/max indicating arrow
      type: "polygon",
      scaleY: min ? -1 : 1,
      shape: {
        points: [
          [0, 0],
          [15, 80],
          [-15, 80],
        ],
      },
      style: {
        fill: "lightgrey",
        // opacity: 0.4,
      },
      z: -100,
      y: chart ? getY(min, index) : 0,
      // y: 60,
      // y: chart
      //   ? Object.values(
      //       chart.getModel().getComponent("parallelAxis")
      //         .coordinateSystem._axesLayout
      //     )[index].position[1] - 20
      //   : 0,
      x: chart
        ? Object.values(
            chart.getModel().getComponent("parallelAxis").coordinateSystem
              ._axesLayout
          )[index].position[0]
        : 0,
    }));

    const test = [
      {
        type: "group",
        children: graphicData,
      },
    ];
    return test;
  }

  function addSwapArrows(): echarts.EChartOption["graphic"] {
    const graphicData = names.map((_, index) => ({
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
                console.log("object");
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
        index !== names.length - 1
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

    const all = [...graphicData, ...addMinMaxIndicators()];
    return all;
    // return graphicData;
  }

  function createOption(names: string[], values: number[][]): EChartOption {
    // Creates the lines on the chart as series data.
    let seriesData: { value: number[]; name: string }[] = [];
    for (let i = 0; i < values.length; i++) {
      seriesData.push({ value: values[i], name: "Solution " + (i + 1) });
    }

    //  Creates the names for the axes as a parallelAxis component.
    const nameAxis: object[] = [];
    let min;
    let max;
    if (names.length > 0) {
      for (let i = 0; i < names.length; i++) {
        if (ranges) {
          min = ranges[i] ? ranges[i].min : undefined;
          max = ranges[i] ? ranges[i].max : undefined;
        }
        let nameObj = {
          dim: i,
          name: names[i],
          min: min,
          max: max,
        };
        nameAxis.push(nameObj);
      }
    } else {
      for (let i = 0; i < values[0].length; i++) {
        if (ranges) {
          min = ranges[i] ? ranges[i].min : undefined;
          max = ranges[i] ? ranges[i].max : undefined;
        }
        let nameObj = {
          dim: i,
          name: "Objective " + (i + 1),
          min: min,
          max: max,
        };
        nameAxis.push(nameObj);
        data.names.push("Objective " + (i + 1) + "\n (▲)");
      }
    }

    if (typeof document !== "undefined") {
      // chart = echarts.getInstanceByDom(document.getElementById(id));
    } else {
      // chart = undefined;
    }

    // Create the option object for the whole chart.
    return {
      color: colorPalette,
      colorBy: "series",
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
          // colorBy: "series",
          data: seriesData,
        },
      ],
      graphic: addSwapArrows(),
    };
  }
  onMount(() => {
    chart = echarts.init(chartDiv);
    chart.setOption(option);
    chart.setOption({
      graphic: addSwapArrows(),
    });

    // chart.setOption({
    //   graphic:
    // })

    // BRUSHING debugging
    chart.on("axisareaselected", function () {
      var series1 = chart.getModel().getSeries()[0];
      // var series2 = chart.getModel().getSeries()[1];
      var indices1 = series1.getRawIndicesByActiveState("active");
      // var indices2 = series2.getRawIndicesByActiveState('active');
      console.log(indices1);
      // console.log(indices2);
    });
    // createChart(id, option);

    chart.on("brush", function (params) {
      console.log(this);
      console.log(params);
    });
    chart.on("brushend", function (params) {
      console.log(this);
      console.log(params);
    });
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

<div style="height:100%; width:100%" bind:this={chartDiv} />
