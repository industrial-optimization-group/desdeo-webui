<!--@component
  THIS COMPONENT DOES NOT WORK IN REAL APPLICATION. The swap arrows are too buggy
  Creates a parallel axis chart using the ECharts library. This component is not linked to other components and can be used independently. 
  
  @param {number[][]} values - The values for each axis. Outside arrays are the lines and inside arrays are the values of the line.
  @param {boolean[]} [lowerIsBetter=[]] - An array of boolean values that indicate whether each axis should be minimized.
  @param {boolean} [showIndicators=false] - A boolean value that indicates whether to show the min/max indicators on the chart.
  @param {Ranges[]} [ranges=undefined] - An array of Ranges -objects that define the ranges for each axis.
  @param {string[]} [names=[]] - An array of strings that define the names of each axis.
  @param {number[]} [selectedIndices=[]] - An array of indices that define the selected data points (lines) on the chart.
  @param {number} [highlightedIndex=undefined] - An index of the highlighted data point (line) on the chart.
  @param {boolean} [disableInteraction=false] - A boolean value that indicates whether the user can interact with the chart.
  @param {Ranges} [brushInterval=undefined] - A Ranges -object that defines the latest brush interval. 
  @param {Ranges[]} [BrushIntervalPerAxis=[]] - An array of Ranges -objects that define the brush interval for each axis. 

-->
<!-- TODO: min/max text should show also when names given manually -->

<script lang="ts">
  import type * as echarts from "echarts";
  // import { getAxisY, getAxisX } from "$lib/components/visual/visualization/props-linking/ParallelCoordinatePlotBase.svelte";
  // import getAxisY from "$lib/components/visual/visualization/props-linking/ParallelCoordinatePlotBase.svelte";
  // import getAxisX from "$lib/components/visual/visualization/props-linking/ParallelCoordinatePlotBase.svelte";
  // import { getAxisX, getAxisY } from "$lib/components/visual/visualization/props-linking/ParallelCoordinatePlotBase.svelte";
  import {
    colorPalette,
    selectedLineStyle,
  } from "$lib/components/visual/constants";
  import type { Ranges } from "$lib/components/visual/types";
  import type { EChartOption } from "echarts";
  import { getAxisY, getAxisX } from "$lib/components/visual/helperFunctions";
  import { onMount } from "svelte";
  import ParallelCoordinatePlotBase from "./ParallelCoordinatePlot.svelte";
  // Props for this component:
  export let values: number[][];
  export let lowerIsBetter: boolean[] = [];
  export let showIndicators = false;
  export let ranges: Ranges[] | undefined = undefined;
  export let names: string[] = []; // At the moment breaks the graphics if not given the same amount as values (objectives/axis)
  export let selectedIndices: number[] = [];
  export let highlightedIndex: number | undefined = undefined;
  export let disableInteraction = false;
  export let brushInterval: Ranges | undefined = undefined;
  export let brushIntervalPerAxis: Ranges[] = [];
  // export let data: SolutionData;

  let chart: echarts.ECharts | undefined;
  let option: EChartOption;

  $: data = { names: names, values: values };
  $: if (values) {
    {
      option = createOption(names, values);
    }
  }

  const hoverLineStyle = {
    color: selectedLineStyle.color,
    width: 7,
    opacity: 0.4,
  };

  const lineStyle = {
    width: 3.5,
    opacity: 1,
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

  /**
   * Adds the min/max indicators to parallelAxes. The indicators are added as a
   * graphic component.
   */
  function createMinMaxIndicators() {
    // Add a arrow for each axis
    const indicatorArrows = lowerIsBetter.map((min, index) => ({
      // Background min/max indicating arrow
      type: "polygon",
      scaleY: min ? -1 : 1, // Flips the arrow if it is for minimization
      shape: {
        points: [
          // TODO make arrow size dynamic (not hardcoded)
          [0, 0],
          [15, 80],
          [-15, 80],
        ],
      },
      style: {
        fill: "lightgrey",
      },
      z: -100,
      y: chart ? getAxisY(min, index, chart) : 0,
      x: chart ? getAxisX(index, chart) : 0,
    }));

    const graphicData = [
      {
        type: "group",
        children: indicatorArrows,
      },
    ];
    return graphicData;
  }

  function createSwapArrows() {
    const graphicArrows = names.map((_, index) => ({
      type: "group",
      bottom: 20,
      silent: disableInteraction,
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
                // console.log("object");
                swapAxes(index, index - 1);
              },

              x: chart ? getAxisX(index, chart) : 0,
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
              x: chart ? getAxisX(index, chart) : 0,
            }
          : undefined,
      ],
    }));
    // let object = getChartModel(chart).getComponent("parallelAxis").coordinateSystem._axesLayout
    // Object.values(object)[0].position[0]
    return graphicArrows;
  }

  /**
   * Creates the graphic data object with the min/max indicators and the swap
   * arrows.
   */
  function createGraphicData(): echarts.EChartOption["graphic"] {
    // Doesn't add the min/max indicator graphics if they are not wanted.
    const graphicData = showIndicators
      ? [...createSwapArrows(), ...createMinMaxIndicators()]
      : createSwapArrows();
    return graphicData;
  }

  /** Creates the option data for the parallelAxis component. */
  function createParallelAxisOption() {
    //  Creates the names for the axes as a parallelAxis component.
    const parallelAxisOption: object[] = [];
    let min;
    let max;
    // If names are given, use them to set the names for the axes.
    if (names.length > 0) {
      for (let i = 0; i < names.length; i++) {
        // If ranges are given, use them to set the min and max values for the axis.
        if (ranges) {
          // If the range is not given or is given undefined, use the default min and max values.
          min = ranges[i] ? ranges[i].min : "dataMin";
          max = ranges[i] ? ranges[i].max : "dataMax";
        }
        let nameObj = {
          dim: i,
          name: lowerIsBetter[i] ? names[i] + "\n (▼)" : names[i] + "\n (▲)",
          min: min ? min : "dataMin",
          max: max ? max : "dataMax",
        };
        parallelAxisOption.push(nameObj);
      }
    }
    // If names are not given, use the default names.
    else {
      for (let i = 0; i < values[0].length; i++) {
        if (ranges) {
          min = ranges[i] ? ranges[i].min : undefined;
          max = ranges[i] ? ranges[i].max : undefined;
        }
        let nameObj = {
          dim: i,
          // name: "Objective " + (i + 1),
          min: min,
          max: max,
        };
        parallelAxisOption.push(nameObj);
        // let minMaxIndicator = lowerIsBetter[i] ? "\n (▼)" : "\n (▲)";
        // // let minMaxIndicator = minimize[i]? "\n (min)":"\n (max)";
        // data.names.push("Objective " + (i + 1) + minMaxIndicator);
      }
    }
    return parallelAxisOption;
  }

  /**
   * Creates the option object for the chart.
   *
   * @param names - The names of the axes.
   * @param values - The values to be shown on the parallel coordinate.
   */
  function createOption(names: string[], values: number[][]): EChartOption {
    // Creates the lines on the chart as series data.
    let seriesData: { value: number[]; name: string }[] = [];
    for (let i = 0; i < values.length; i++) {
      seriesData.push({ value: values[i], name: "Alternative " + (i + 1) });
    }
    // Create the option object for the whole chart.
    return {
      color: colorPalette,
      tooltip: {
        // TODO: Check if there is better way to achieve no type errors, check https://github.com/apache/echarts/issues/14723
        formatter: function (params) {
          let newParams: EChartOption.Tooltip.Format =
            params as EChartOption.Tooltip.Format;
          let result = newParams.name + "<br>";
          for (let i = 0; i < newParams.data.value.length; i++) {
            result += newParams.data.value[i] + "<br>";
          }
          return result;
        },
      },
      parallel: {
        parallelAxisDefault: {
          axisTick: {
            show: false,
            length: 0.8,
            // length: -2,
            lineStyle: {
              cap: "round",
              width: 4,
            },
          },
          axisLabel: {
            inside: true,
          },
        },
      },
      parallelAxis: createParallelAxisOption(),
      toolbox: { show: false },
      brush: {
        brushMode: "multiple",
        throttleType: "debounce",
        throttleDelay: 300,
      },
      series: [
        {
          silent: disableInteraction,
          type: "parallel",
          lineStyle: lineStyle,
          selectedMode: "multiple",
          // TODO: Implement changing line color without using select. Now select causes type error, thus the ts-ignore. For some reason parallel axis does not have select property, but for example bar charts have:https://echarts.apache.org/en/option.html#series-bar.select, parallel: https://echarts.apache.org/en/option.html#series-parallel
          //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore -- Error says that disabled doesn't exist in the echarts series type, but in the documentation it exists. Might be because it's a new property, so they have not updated the type yet. https://echarts.apache.org/en/option.html#series-bar.emphasis.disabled
          select: {
            lineStyle: selectedLineStyle,
          },
          emphasis: {
            lineStyle: hoverLineStyle,
          },
          // colorBy: "series",
          data: seriesData,
        },
      ],
      graphic: createGraphicData(),
    };
  }

  onMount(() => {
    option = createOption(names, values);
    // console.log("object");
  });
</script>

<ParallelCoordinatePlotBase
  newOptions={option}
  {values}
  bind:selectedIndices
  bind:highlightedIndex
  bind:brushInterval
  bind:brushIntervalPerAxis
  bind:names
  bind:lowerIsBetter
  bind:showIndicators
  bind:ranges
  bind:disableInteraction
  bind:chart
/>
