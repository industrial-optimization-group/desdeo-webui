<!--
  @component
    @name SingleHorizontalBar
    @description Renders a single horizontal bar chart using the ECharts library.
    @props
      @param {number} lowerBound - The lower bound of the chart.
      @param {number} higherBound - The higher bound of the chart.
      @param {number} selectedValue - The selected value to display on the chart.
      @param {number} previousValue - The previous value to display on the chart.
      @param {number} colorPaletteIndex - The index of the color palette to use for the chart.
      @param {boolean} inputs - Whether to display input fields for the chart.
    @events
      updateSelected - Emitted when the selected value is updated. 
-->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  // import type { SolutionData } from "./types";
  import { colorPalette } from "./stores";

  export let lowerBound: number;
  export let higherBound: number;
  export let selectedValue: number;
  export let previousValue = 0;
  // export let isMin = true;
  export let colorPaletteIndex = 0;
  // export let divId: string;
  export let inputs = false;
  export function updateSelected() {
    updateLine();
  }
  // $: selectedValue

  // const errColor = "red";
  const arrowSize = 15;
  const arrowColor = "black";

  let chartDiv: HTMLElement;
  let chart: echarts.EChartsType;
  const solutionValue = selectedValue;

  // Create the option object for the whole chart.
  let option: echarts.EChartOption = {
    xAxis: {
      axisLabel: {
        margin: 5,
        lineHeight: 10,
      },
      axisLine: {
        show: false,
        onZero: false,
      },
      id: "xAxis",
      min: lowerBound,
      max: higherBound,
      type: "value",
      axisPointer: {
        show: true,
        lineStyle: {
          type: "solid",
          width: 3,
          color: "black",
        },
      },
      splitLine: {
        lineStyle: {
          color: "black",
          opacity: 0.2,
        },
      },
      data: [lowerBound],
    },
    yAxis: {
      id: "yAxis",
      type: "category",
      axisLabel: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    grid: {
      show: true,
      borderWidth: 1,
      borderColor: "gray",
      left: arrowSize * 2,
      right: arrowSize * 2,
      top: arrowSize,
      bottom: arrowSize,
    },
  };

  onMount(() => {
    chart = echarts.init(chartDiv);
    addHorizontalBar(option);
  });

  function addHorizontalBar(
    option: echarts.EChartOption
    // id?: string,
    // idx?: number
  ) {
    chart.setOption(option);
    let animation = true;
    if (lowerBound < 0) {
      animation = false;
    }
    chart.setOption({
      // Set the min max values for the bar
      // xAxis: {
      //   min: lowerBound,
      //   max: higherBound,
      // },
      // Set the color of the bar
      series: {
        color: colorPalette[colorPaletteIndex],
        showBackground: true,
        backgroundStyle: {
          color: colorPalette[colorPaletteIndex],
          opacity: 0.2,
        },
        type: "bar",
        animation: animation,
        data: [[selectedValue]],
        barWidth: "100%",
      },
    });

    // TODO: How to get the gridRect without using the private methods?
    const gridModel = chart.getModel().getComponent("grid");
    const gridView = chart.getViewOfComponentModel(gridModel);
    const gridRect = gridView.group.getBoundingRect();

    // This option adds the interactive custom graphic elements to the chart
    const graphicOptions = {
      graphic: [
        // Add aspiration value line
        {
          id: "rec",
          type: "rect",
          x: chart.convertToPixel({ seriesIndex: 0 }, [selectedValue, 0])[0],
          y: gridRect.y,
          z: 100,
          transition: "all",
          shape: {
            height: gridRect.height,
          },
          style: {
            stroke: "red",
            lineWidth: 3,
          },
        },

        // Add a line for previous preference
        {
          id: "prev_line",
          type: "rect",
          x: chart.convertToPixel({ seriesIndex: 0 }, [previousValue, 0])[0],
          y: gridRect.y,
          z: 5,
          transition: "all",
          shape: {
            height: gridRect.height,
          },
          style: {
            stroke: "blue",
            lineDash: [4],
            lineWidth: 3,
          },
        },
        {
          id: "verticalGroup",
          type: "group",
          name: "interactiveButtons",
          children: [
            // Add a button (arrow) to reset the aspiration value to the solution value.
            {
              id: "arrow",
              type: "polygon",
              // group: "test",
              x: chart.convertToPixel({ seriesIndex: 0 }, [
                selectedValue,
                0,
              ])[0],
              shape: {
                points: [
                  [-arrowSize, 0],
                  [arrowSize, 0],
                  [0, arrowSize],
                ],
              },
              style: {
                fill: arrowColor,
              },
              onclick: () => {
                selectedValue = solutionValue;
                updateLine();
              },
            },
          ],
        },
        // Add arrows
        {
          id: "leftRightGroup",
          type: "group",
          top: "center",
          name: "interactiveButtons",
          children: [
            //Left Arrow
            {
              type: "polygon",
              id: "left",

              shape: {
                points: [
                  [-1, arrowSize],
                  [-1, -arrowSize],
                  [-arrowSize, 0],
                ],
              },
              style: {
                fill: arrowColor,
              },
              left: 0,
            },
            // Right Arrow
            {
              type: "polygon",
              id: "right",
              shape: {
                points: [
                  [1, arrowSize],
                  [1, -arrowSize],
                  [arrowSize, 0],
                ],
              },
              style: {
                fill: arrowColor,
              },
              left: chart.getWidth() - arrowSize,
            },
          ],
          // onclick event for the arrows
          onclick: (params: { target: { id: string } }) => {
            const targetId = params.target.id;
            if (targetId === "left") {
              selectedValue = lowerBound;
            } else if (targetId === "right") {
              selectedValue = higherBound;
            }
            updateLine();
          },
        },
        // Invisible rectangle for the whole grid area, so that clicking on the grid area works correctly
        {
          type: "rect",
          shape: {
            x: gridRect.x,
            y: gridRect.y,
            width: gridRect.width,
            height: gridRect.height,
          },
          style: {
            fill: "transparent",
            stroke: "transparent",
            lineWidth: 0,
          },
        },
      ],
    };
    chart.setOption(graphicOptions);
    // Add event listener which adds and updates the aspiration line on the graph.
    chart.getZr().on("click", function (params) {
      if (params.target == null) {
        return;
      }
      const targetParentName: string = params.target.parent.name;
      // Only update the line if click has not happened on the interactive buttons
      if (targetParentName !== "interactiveButtons") {
        updateLine(params);
        return;
      }
    });
  }

  /**
   * Updates the aspiration (preference) line on the graph.
   *
   * @param params The parameters of the click event.
   * @param chart The chart object.
   * @param idx The index of the input field value. TODO: make default chart
   *   type
   */
  function updateLine(params?: echarts.ElementEvent | Event) {
    let newOption = {};
    let chartDiv: HTMLDivElement | HTMLCanvasElement;
    // let chart: echarts.ECharts;
    if (params != null) {
      if (params instanceof Event) {
        const target = params.target as HTMLInputElement | null;
        const parentElem = target?.parentElement;
        if (!target || !parentElem) {
          return;
        }
        chartDiv = target.parentElement.nextElementSibling as HTMLDivElement;
        chart = echarts.getInstanceByDom(chartDiv);
        newOption = {
          graphic: {
            id: "rec",
            x: chart.convertToPixel({ seriesIndex: 0 }, [selectedValue, 0])[0],
          },
        };
      } else {
        chartDiv = (params.event.currentTarget as HTMLDivElement)
          .parentElement as HTMLDivElement;
        chart = echarts.getInstanceByDom(chartDiv);
        selectedValue = chart.convertFromPixel({ seriesIndex: 0 }, [
          params.offsetX,
          params.offsetY,
        ])[0];
        newOption = {
          graphic: [
            {
              id: "rec",
              x: chart.convertToPixel({ seriesIndex: 0 }, [
                selectedValue,
                0,
              ])[0],
            },
          ],
        };
      }
    } else {
      newOption = {
        graphic: [
          {
            id: "rec",
            x: chart.convertToPixel({ seriesIndex: 0 }, [selectedValue, 0])[0],
          },
        ],
      };
    }

    chart.setOption(newOption);
  }
</script>

<!-- By default creates just the horizontal bar. If inputs prop is true adds input and input logic -->
{#if inputs}
  <div style="display: flex; margin-top:0.75em">
    <!-- Div for inputs -->
    <div>
      <input
        type="number"
        bind:value={selectedValue}
        on:change={() => updateSelected()}
      />
      <label for="prev">Previous preference: </label>
      <input
        name="prev"
        type="number"
        readonly
        bind:value={previousValue}
        on:change={() => updateSelected()}
        style="border: 2; box-shadow: none;background-color: rgba(232 234 241);"
      />
    </div>
    <div style="height:100%; width:100%" bind:this={chartDiv} />
  </div>
{:else}
  <div style="height:100%; width:100%" bind:this={chartDiv} />
{/if}
