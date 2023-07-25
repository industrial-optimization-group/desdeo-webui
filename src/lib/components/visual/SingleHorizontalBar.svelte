<!--
  @component
    @description Renders a single horizontal bar chart using the ECharts library.
    @props
      @param {number} lowerBound - The lower bound of the chart.
      @param {number} higherBound - The higher bound of the chart.
      @param {number} solutionValue - The solution value to display on the chart.
      @param {number} selectedValue - The value that the user has selected.
      @param {number} previousValue - The previous value to display on the chart.
      @param {number} colorPaletteIndex - The index of the color palette to use for the chart.
      @param {boolean} inputs - Whether to display input fields for the chart.
 
-->
<!-- 
  TODO: Implement minimize/maximize coloring
  TODO: Implement restricting line drawing to the chart area
 -->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  // import type { SolutionData } from "./types";

  export let lowerBound: number;
  export let higherBound: number;
  export let solutionValue: number | undefined = undefined;
  export let selectedValue: number | undefined = undefined;
  export let previousValue: number | undefined = undefined;
  export let barColor = "#a6b1e1";
  // export let isMin = true;
  // export let divId: string;
  export let inputs = false;

  $: console.log(selectedValue);
  $: if (selectedValue != null) {
    updateAspirationLine(selectedValue);
  }
  // $: updateAspirationLine(selectedValue);
  $: if (previousValue != null) {
    updatePreviousLine(previousValue);
  }
  $: if (solutionValue != null) {
    updateSolutionBar(solutionValue);
  }

  const arrowSize = 15;
  const arrowColor = "black";
  let chartDiv: HTMLElement;
  let chart: echarts.EChartsType;

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

  function addHorizontalBar(option: echarts.EChartOption) {
    chart.setOption(option);
    chart.setOption({
      series: [
        {
          stack: "negative",
          color: barColor,
          showBackground: true,
          backgroundStyle: {
            color: barColor,
            opacity: 0.2,
          },
          type: "bar",
          data: [[solutionValue]],
          barWidth: "100%",
          emphasis: {
            disabled: true,
          },
        },
      ],
    });
    // Logic when the bar starts from a negative value (echarts does not support this by default)
    if (lowerBound < 0) {
      chart.setOption({
        series: [
          {
            id: "lower",
            stack: "negative",
            color: barColor,
            showBackground: true,
            backgroundStyle: {
              color: barColor,
              opacity: 0.2,
            },
            type: "bar",
            animation: false,
            data: [[lowerBound]],
            barWidth: "100%",
            emphasis: {
              disabled: true,
            },
          },
        ],
      });
    }

    // TODO: How to get the gridRect without using the private method?
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
          invisible: selectedValue == null ? true : false,
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
          id: "prevLine",
          type: "rect",
          invisible: previousValue == null ? true : false,
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
              // If the solution value is not defined, the arrow is invisible
              x: solutionValue
                ? chart.convertToPixel({ seriesIndex: 0 }, [
                    solutionValue,
                    0,
                  ])[0]
                : 0,
              invisible: solutionValue ? false : true,
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
    // Add event listener which updates the aspiration line value.
    chart.getZr().on("click", function (params) {
      if (params.target == null) {
        return;
      }
      const targetParentName: string = params.target.parent.name;
      // Only update the line if click has not happened on the interactive buttons
      if (targetParentName !== "interactiveButtons") {
        selectedValue = chart.convertFromPixel({ seriesIndex: 0 }, [
          params.offsetX,
          params.offsetY,
        ])[0];
      }
    });
  }

  /**
   * Updates the aspiration line value and calls the function which updates the
   * position in the chart
   *
   * @param newValue The value as a real value
   */
  function updateAspirationLine(newValue: number) {
    selectedValue = newValue;
    updateLinePosition("rec", newValue);
  }

  /**
   * Updates the previous line value and calls the function which updates the
   * position in the chart
   *
   * @param newValue The value as a real value
   */
  function updatePreviousLine(newValue: number) {
    previousValue = newValue;
    updateLinePosition("prevLine", newValue);
  }

  /**
   * Updates the line to the chart according to the newValue given
   *
   * @param lineId The id of the line that will be updated
   * @param newValue The value of the line
   */
  function updateLinePosition(lineId: string, newValue: number) {
    if (!chart) {
      return;
    }
    let newOption = {
      graphic: [
        {
          id: lineId,
          invisible: false,
          x: chart.convertToPixel({ seriesIndex: 0 }, [newValue, 0])[0],
        },
      ],
    };
    chart.setOption(newOption);
  }

  /**
   * Updates the solution bar (the colored bar) to the chart according to the
   * newValue given
   *
   * @param newValue
   */
  function updateSolutionBar(newValue: number) {
    if (chart) {
      chart.setOption({
        series: [
          {
            data: [[newValue]],
          },
        ],
      });
    }
  }
</script>

<!-- By default creates just the horizontal bar. If inputs prop is true adds input and input logic -->
{#if inputs}
  <div style="display: flex; margin-top:0.75em">
    <!-- Div for inputs -->
    <div>
      <input type="number" bind:value={selectedValue} />
      <label for="prev">Previous preference: </label>
      <input
        name="prev"
        type="number"
        readonly
        bind:value={previousValue}
        style="border: 2; box-shadow: none;background-color: rgba(232 234 241);"
      />
    </div>
    <div style="height:100%; width:100%" bind:this={chartDiv} />
  </div>
{:else}
  <div style="height:100%; width:100%" bind:this={chartDiv} />
{/if}
