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
  TODO: BUG: When bounds are really small and close together, ex. [-1.1653, -1.1504], selected line doesnt work correctly (position is wrong)
 -->
<script lang="ts">
  import * as echarts from "echarts";
  import { onMount } from "svelte";
  import { referencePointStyle } from "./stores";
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
  export let decimalPrecision = 2;

  // $: console.log(selectedValue);
  $: if (selectedValue != null) {
    updateAspirationLine(
      Number.parseFloat(selectedValue.toFixed(decimalPrecision))
    );
  }
  // $: updateAspirationLine(selectedValue);
  $: if (previousValue != null) {
    updatePreviousLine(
      Number.parseFloat(previousValue.toFixed(decimalPrecision))
    );
  }
  $: if (solutionValue != null) {
    updateSolutionBar(solutionValue);
    //updateSolutionBar(Number.parseFloat(solutionValue.toFixed(decimalPrecision)));
  }

  const arrowSize = 15;
  const arrowColor = "black";
  const dragArrowColor = "white";
  const hoverLineColor = "gray";

  let chartDiv: HTMLElement;
  let chart: echarts.EChartsType;

  // Create the option object for the whole chart.
  let option: echarts.EChartOption = {
    tooltip: {
      // show:false,
      trigger: "none",
      triggerOn: "none",
      position: [20, -30],
      // formatter: function(params) {
      //   console.log(params);
      //   return "jelklasdj";
      // },
    },
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
        z: 1000,
        show: true,
        lineStyle: {
          type: "solid",
          width: 2,
          color: hoverLineColor,
          // opacity: 0.5,
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
      left: arrowSize * 1.7,
      right: arrowSize * 1.7,
      top: arrowSize + 2,
      bottom: arrowSize,
    },
  };

  onMount(() => {
    chart = echarts.init(chartDiv);
    addHorizontalBar(option);
    // console.log(chart.getOption().graphic);
    // chart.on("showtip", function (params) {
    //   console.log(params);
    //   // console.log(this);
    // });
  });

  function addHorizontalBar(option: echarts.EChartOption) {
    chart.setOption(option);
    let datalowerBar;
    if (solutionValue) {
      datalowerBar = higherBound < 0 ? [[solutionValue]] : [[lowerBound]];
    } else {
      datalowerBar = higherBound < 0 ? [[0]] : [[lowerBound]];
    }

    chart.setOption({
      series: [
        {
          id: "higher",
          stack: "negative",
          color: lowerBound < 0 || higherBound < 0 ? "transparent" : barColor,
          showBackground: true,
          backgroundStyle: {
            color: barColor,
            opacity: 0.2,
          },
          type: "bar",
          data: solutionValue ? [[solutionValue]] : [[0]],
          barWidth: "100%",
          emphasis: {
            //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore -- Error says that disabled doesn't exist in the echarts series type, but in the documentation it exists. Might be because it's a new property, so they have not updated the type yet. https://echarts.apache.org/en/option.html#series-bar.emphasis.disabled
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
            type: "bar",
            animation: false,
            data: datalowerBar,
            barWidth: "100%",
            emphasis: {
              //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore -- Error says that disabled doesn't exist in the echarts series type, but in the documentation it exists. Might be because it's a new property, so they have not updated the type yet. https://echarts.apache.org/en/option.html#series-bar.emphasis.disabled
              disabled: true,
            },
          },
        ],
      });
    }

    // TODO: How to get the gridRect without using the private method?
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore -- getModel is private method, but no easy workaround available. Might break in the future.
    // TODO: Better documentation
    const gridModel = chart.getModel().getComponent("grid");
    //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore -- same explanation as above
    const gridView = chart.getViewOfComponentModel(gridModel);
    const gridRect = gridView.group.getBoundingRect();

    const scaleValue = gridRect.height * 0.05;
    // const ratio = gridRect.height / scaleValue / 10;
    // This option adds the interactive custom graphic elements to the chart
    const graphicOptions = {
      graphic: [
        // Add aspiration value line
        {
          id: "aspirationGroup",
          type: "group",
          x: chart.convertToPixel({ seriesIndex: 0 }, [selectedValue, 0])[0],
          // z: 1000,
          draggable: "horizontal",
          silent: selectedValue == null ? true : false,
          children: [
            // Dragging circle with arrows
            // {

            // },

            // Dragging image
            // {
            //   type: "image",
            //   id: "dragImage",
            //   z: 501,
            //   left: -15,
            //   invisible: selectedValue == null ? true : false,
            //   style: {
            //     image: "../src/lib/assets/Picture2.png",
            //     width: arrowSize,
            //     height: arrowSize,
            //     y: chart.getHeight() / 2 - arrowSize/2,
            //     fill: "blue",
            //     stroke: "blue",
            //   },
            // },
            // Dragging circle
            {
              type: "group",
              id: "drag",
              y: chart.getHeight() / 2,

              // scale: [10,10],
              // scale: [scaleValue, scaleValue],

              children: [
                {
                  type: "circle",
                  id: "dragCircle",

                  z: 498,
                  invisible: selectedValue == null ? true : false,
                  shape: {
                    r: scaleValue * 2 + referencePointStyle.lineWidth,
                  },
                  style: {
                    fill: referencePointStyle.stroke,
                    // stroke: "black",
                    lineWidth: 2,
                    // opacity: 0.7,
                  },
                },
                {
                  type: "polyline",
                  id: "dragLeft",
                  right: referencePointStyle.lineWidth / 10,
                  invisible: selectedValue == null ? true : false,
                  z: 499,
                  // scale: [0.5, 0.5],
                  style: {
                    // fill: "black",
                    stroke: dragArrowColor,
                    lineWidth: 2,
                  },
                  shape: {
                    points: [
                      [0, scaleValue],
                      [-scaleValue, 0],
                      [0, -scaleValue],
                    ],
                  },
                },
                {
                  type: "polyline",
                  id: "dragRight",
                  left: referencePointStyle.lineWidth / 10,
                  scaleX: -1,
                  z: 499,
                  invisible: selectedValue == null ? true : false,
                  // scale: [-0.5, 0.5],
                  // scaleX: -1,
                  style: {
                    stroke: dragArrowColor,
                    // fill: "black",
                    lineWidth: 2,
                  },
                  shape: {
                    points: [
                      [0, scaleValue],
                      [-scaleValue, 0],
                      [0, -scaleValue],
                    ],
                  },
                },
                // {
                //   type:"line",
                //   z: 502,
                //   style: {
                //     stroke: "blue",
                //     opacity: 0.2,
                //     lineWidth: 2,
                //   },
                //   shape: {
                //     x1: 0,
                //     y1: scaleValue,
                //     x2: 0,
                //     y2: -scaleValue,
                //   },

                // },
              ],
            },
            {
              id: "rec",
              type: "rect",
              // x: chart.convertToPixel({ seriesIndex: 0 }, [
              //   selectedValue,
              //   0,
              // ])[0],
              y: gridRect.y,
              invisible: selectedValue == null ? true : false,
              z: 300,
              transition: "all",
              shape: {
                height: gridRect.height,
              },
              style: {
                stroke: referencePointStyle.stroke,
                lineWidth: referencePointStyle.lineWidth,
                // opacity: 0.8,
              },

              // draggable: "horizontal",
            },
          ],
          ondragstart: () => {
            chart.setOption({
              xAxis: {
                axisPointer: {
                  lineStyle: {
                    color: "transparent",
                  },
                },
              },
            });
          },
          ondrag: function (params: { offsetX: number; offsetY: number }) {
            let comp = getLineComponent(chart, "valueArea");
            let left = comp.shape.x;
            let right = comp.shape.x + comp.shape.width;
            let lastPosition;
            if (this.x < left) {
              lastPosition = left;
              selectedValue = lowerBound;
            } else if (this.x > right) {
              lastPosition = right;
              selectedValue = higherBound;
            }

            if (this.x > left && this.x < right) {
              if (Math.abs(this.x - params.offsetX) > 2) {
                selectedValue = chart.convertFromPixel({ seriesIndex: 0 }, [
                  this.x,
                  this.x,
                ])[0];
              } else {
                selectedValue = chart.convertFromPixel({ seriesIndex: 0 }, [
                  params.offsetX,
                  params.offsetY,
                ])[0];
              }
              lastPosition = params.offsetX;
            } else {
              chart.setOption({
                graphic: [
                  {
                    id: "aspirationGroup",
                    x: lastPosition,
                    transition: false,
                  },
                ],
              });
            }
            // Update the axispointer label to show the selected value, not the value of the mouse position
            chart.setOption({
              xAxis: {
                axisPointer: {
                  label: {
                    formatter: () => {
                      return "Drag value: " + selectedValue;
                    },
                  },
                },
              },
            });
          },
          ondragend: function () {
            // Reset the axispointer label
            chart.setOption({
              xAxis: {
                axisPointer: {
                  lineStyle: {
                    color: hoverLineColor,
                  },
                  label: undefined,
                },
              },
            });
          },
        },
        // Add a circle for previous preference
        {
          id: "prevLine",
          type: "circle",
          invisible: previousValue == null ? true : false,
          x: chart.convertToPixel({ seriesIndex: 0 }, [previousValue, 0])[0],

          z: 5,
          transition: "all",
          shape: {
            cy: chart.getHeight() / 2,
            r: 5,
          },
          style: {
            fill: arrowColor,
            fillOpacity: 0.6,
            stroke: arrowColor,
            // lineDash: [2],
            lineWidth: 2,
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
                fill: "transparent",
                // fillOpacity: 0,
                stroke: arrowColor,
                lineWidth: 1.25,
              },

              onclick: () => {
                // console.log("click");
                selectedValue = solutionValue;
              },
            },
          ],
        },
        // Add arrows to move the aspiration value to the left or to the right
        {
          id: "leftRightGroup",
          type: "group",
          top: "center",
          name: "interactiveButtons",
          children: [
            //Left Arrow
            {
              type: "polyline",
              id: "left",
              left: 1,
              shape: {
                points: [
                  [0, arrowSize],
                  [-arrowSize, 0],
                  [0, -arrowSize],
                ],
              },
              style: {
                fill: "transparent",
                stroke: arrowColor,
                lineWidth: 2.5,
              },
            },
            // Right Arrow
            {
              type: "polyline",
              id: "right",
              scaleX: -1,
              right: -chart.getWidth() + 1,
              shape: {
                points: [
                  [0, arrowSize],
                  [-arrowSize, 0],
                  [0, -arrowSize],
                ],
              },
              style: {
                fill: "transparent",
                stroke: arrowColor,
                lineWidth: 2.5,
              },
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

    addTooltipListeners("aspirationGroup");
    addTooltipListeners("leftRightGroup");
    addTooltipListeners("verticalGroup");
    addTooltipListeners("prevLine");
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
    updateLinePosition("aspirationGroup", newValue);
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

    let opt =
      lineId === "aspirationGroup"
        ? [
            {
              id: lineId,
              silent: false,
              x: chart.convertToPixel({ seriesIndex: 0 }, [newValue, 0])[0],
              invisible: true,
            },
            {
              // id: "dragImage",
              id: "dragCircle",
              invisible: false,
            },
            {
              id: "rec",
              invisible: false,
            },
            {
              id: "dragLeft",
              invisible: false,
            },
            {
              id: "dragRight",
              invisible: false,
            },
          ]
        : [
            {
              id: lineId,
              silent: false,
              x: chart.convertToPixel({ seriesIndex: 0 }, [newValue, 0])[0],
              invisible: false,
            },
          ];

    let newOption = {
      graphic: opt,
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

  function addTooltipListeners(compID: string) {
    chart.setOption({
      graphic: [
        {
          id: compID,
          onmouseover: showTooltip,
          onmouseout: hideTooltip,
        },
      ],
    });
  }

  // a function that changes opacity of arrow when mouse is over it
  function addOnMouseEffect(compID: string) {
    // let type = getLineComponent(chart, compID).type;
    let styleForArrow = {
      strokeOpacity: 0.5,
    };
    // if (type === "polyline") {
    //   styleForArrow = {
    //     strokeOpacity: 0.5,
    //   };
    // }
    chart.setOption({
      graphic: [
        {
          id: compID,
          onmouseover: () => {
            chart.setOption({
              graphic: [
                {
                  id: compID,
                  style: styleForArrow,
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
                    strokeOpacity: 1,
                  },
                },
              ],
            });
          },
        },
      ],
    });
  }

  function hideTooltip() {
    chart.dispatchAction({
      type: "hideTip",
    });
  }

  function showTooltip(params: {
    target: { id: number | string; parent: { id: number | string } };
  }) {
    // console.log("mouse enter");
    let targetId = params.target.id;
    let idToChek = targetId;
    const parentId = params.target.parent.id;
    if (typeof parentId === "string") {
      idToChek = parentId;
    }
    let tooltipHelpText = "";
    switch (idToChek) {
      case "prevLine":
        tooltipHelpText =
          "Click this button to set the aspiration value to the previous value";
        break;
      case "drag":
      case "aspirationGroup":
        tooltipHelpText = "Drag this line to change the aspiration value";
        break;
      case "verticalGroup":
        tooltipHelpText = "Click this button to reset to the solution value";
        break;
      case "leftRightGroup":
        if (targetId === "left") {
          tooltipHelpText =
            "Click this button to set the aspiration value to the lowest possible value";
        } else {
          tooltipHelpText =
            "Click this button to set the aspiration value to the highest possible value";
        }
        break;
      default:
        break;
    }

    chart.setOption({
      tooltip: {
        show: true,
        trigger: "item",
        formatter: () => {
          return tooltipHelpText;
        },
      },
    });
    chart.dispatchAction({
      type: "showTip",
      seriesIndex: 0,
      dataIndex: 0,
      // x:0,
      // y:0,
    });
  }
</script>

<!-- By default creates just the horizontal bar. If inputs prop is true adds input and input logic -->
{#if inputs}
  <div
    style=" height:100%; width:100%; display: flex; margin-top:2em; margin-bottom:2em"
  >
    <!-- Div for inputs -->
    <div style="height:100%">
      <input type="number" bind:value={selectedValue} step="any" />
      <label for="prev">Previous preference: </label>
      <input
        name="prev"
        type="number"
        readonly
        bind:value={previousValue}
        style=" border: 2; box-shadow: none;background-color: rgba(232 234 241);"
      />
    </div>
    <div style="height:100%; width:60%" bind:this={chartDiv} />
  </div>
{:else}
  <div style="height:100%; width:100%" bind:this={chartDiv} />
{/if}
