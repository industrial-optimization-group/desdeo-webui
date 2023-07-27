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
  import { aspirationLineStyle } from "./stores";
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
      top: arrowSize + 2,
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
          z: 500,
          transition: "all",
          shape: {
            height: gridRect.height,
          },
          style: aspirationLineStyle,
          draggable: "horizontal",
          ondrag: function (params) {
            let comp = getLineComponent(chart, "valueArea");
            let left = comp.shape.x;
            let right = comp.shape.x + comp.shape.width;
            let lastPosition;
            if (params.offsetX < left) {
              lastPosition = left;
              selectedValue = lowerBound;
            } else if (params.offsetX > right) {
              lastPosition = right;
              selectedValue = higherBound;
            }

            if (params.offsetX > left && params.offsetX < right) {
              selectedValue = chart.convertFromPixel({ seriesIndex: 0 }, [
                params.offsetX,
                params.offsetY,
              ])[0];
              lastPosition = params.offsetX;
            } else {
              chart.setOption({
                graphic: [
                  {
                    id: "rec",
                    x: lastPosition,
                    transition: false,
                  },
                ],
              });
            }
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
            stroke: "violet",
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
              scaleY: 0.85,
              scaleX: 0.85,
              y: 2,
              style: {
                fill: barColor,
                // fillOpacity: 0,
                stroke: arrowColor,
                lineWidth: 1,
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
                stroke: arrowColor,
                lineWidth: 1,
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
                stroke: arrowColor,
                lineWidth: 1,
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
          id: "valueArea",
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
    addOnMouseEffect("left");
    addOnMouseEffect("right");
    addOnMouseEffect("arrow");
    // Add event listener which updates the aspiration line value.
    // chart.getZr().on("click", function (params) {
    //   if (params.target == null) {
    //     return;
    //   }
    //   const targetParentName: string = params.target.parent.name;
    //   // Only update the line if click has not happened on the interactive buttons
    //   if (targetParentName !== "interactiveButtons") {
    //     selectedValue = chart.convertFromPixel({ seriesIndex: 0 }, [
    //       params.offsetX,
    //       params.offsetY,
    //     ])[0];
    //   }
    // });
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
      // Update the reset arrow position and make it visible
      chart.setOption({
        graphic: [
          {
            id: "arrow",
            invisible: false,
            transition: "all",
            x: chart.convertToPixel({ seriesIndex: 0 }, [newValue, 0])[0],
          },
        ],
      });
    }
  }

  /**
   * Gets the component of the wanted part of the aspiration or bound line.
   *
   * @param chart The chart where the line is.
   * @param lineId The id of the wanted part of the line.
   */
  function getLineComponent(chart: echarts.EChartsType, lineId: string) {
    let graphicComponent = chart.getOption()
      .graphic as echarts.GraphicComponentOption;
    // Get the component
    // Type check
    if (graphicComponent instanceof Array && graphicComponent.length > 0) {
      return graphicComponent[0].elements.find(
        (property: echarts.GraphicComponentOption) => property.id === lineId
      );
    }
  }

  // a function that changes opacity of arrow when mouse is over it
  function addOnMouseEffect(compID) {
    // getLineComponent(chart, compID);
    chart.setOption({
      graphic: [
        {
          id: compID,

          onmouseover: () => {
            chart.setOption({
              graphic: [
                {
                  id: compID,
                  style: {
                    fillOpacity: 0.5,
                  },
                },
              ],
            });
          },
          onmouseout: () => {
            chart.setOption({
              graphic: [
                {
                  id: compID,
                  style: {
                    fillOpacity: 1,
                  },
                },
              ],
            });
          },
        },
      ],
    });
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
