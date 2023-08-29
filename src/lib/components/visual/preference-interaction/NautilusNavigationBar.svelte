<!--
  @component
    @description A component that displays a Nautilus navigation bar.
    @props
      @param {number} lowerBound - The lower bound, worst value (nadir value).
      @param {number} higherBound - The higher bound, best value (ideal value).
      @param {number} iterations - The number of iterations.
      @param {number} currentIterationIndex - The index of the current iteration.
      @param {number} selectedValue - The aspiration value that the user has selected.
      @param {number} selectedBoundValue -The bound value that the user has selected .
      @param {Array<Array<number>>} uncertaintyBounds - The uncertainty bounds to drawn on the chart.
      @param {boolean} disableInteraction - Controls whether the user can interact with the chart.

    
-->
<!-- 
  TODO: documentation
  TODO: Fix draggable oldLines
  TODO: Make YAxis visible
  TODO: Min/Max prop
  TODO: Color prop
  TODO: Why the lines on the drawn region are not smooth?
  TODO: Add restriction which prevents dragging line outside feasible region
  TODO: Divide applyForMultipleLines to 2 different functions
   -->
<script lang="ts">
  import { onMount } from "svelte";
  import * as echarts from "echarts";
  import {
    aspirationLineStyle,
    boundLineStyle,
  } from "$lib/components/visual/constants";
  import { getChartModel } from "$lib/components/visual/helperFunctions";

  // Props
  export let lowerBound: number;
  export let higherBound: number;
  export let iterations: number;
  export let currentIterationIndex = 0;
  export let selectedValue: number | undefined = undefined;
  export let selectedBoundValue = lowerBound;
  export let uncertaintyBounds: number[][];
  export let disableInteraction = false;
  export let yAxisMax: number | undefined = undefined;
  export let yAxisMin: number | undefined = undefined;
  // Local variables
  let chartDiv: HTMLDivElement;
  let chart: echarts.EChartsType;
  let lastPosition: number;
  let objShape: number[][] = [];
  // Reactive statements
  $: updateLine("aspiration", selectedValue);
  $: updateLine("bound", selectedBoundValue);
  $: updateOnNewStep(currentIterationIndex);
  $: updateInteractivity(disableInteraction);
  $: stepBack = false;

  /**
   * Updates the data that is used to draw the feasible region. Draws until the
   * current iteration and then draws back to the first iteration.
   */
  function updateData() {
    objShape = [];
    for (let index = 0; index <= currentIterationIndex; index++) {
      let iterationBounds = uncertaintyBounds[index];
      const lowerBound = iterationBounds[0];
      objShape.push([index, lowerBound]);
    }
    for (let index = currentIterationIndex; index >= 0; index--) {
      let iterationBounds = uncertaintyBounds[index];
      const upperBound = iterationBounds[1];
      objShape.push([index, upperBound]);
    }
  }

  /**
   * Draws the feasible region on the chart.
   *
   * @param api The api of the chart.
   */
  function draw(
    api: echarts.EChartOption.SeriesCustom.RenderItemApi
  ): echarts.EChartOption.SeriesCustom.RenderItemReturnPolygon {
    updateData();
    let points = [];
    if (!api.coord || !api.visual) {
      return {};
    }
    for (let i = 0; i < objShape.length; i++) {
      points.push(api.coord(objShape[i]));
    }
    let color = api.visual("color");
    return {
      type: "polygon",
      // transition doesnt work as expected, so it's better not to use it.
      // transition: ["shape"], // transition option not defined in RenderItemReturnPolygon, but is in the documentation:https://echarts.apache.org/en/option.html#series-custom.renderItem.return_polygon.transition
      // Should RenderItemReturnPolygon be extended to include the transition property?
      shape: {
        points: points,
        // smooth: 0.05,
      },
      style: {
        fill: color,
        stroke: echarts.color.lift(color, 0.1),
      },
    };
  }

  /** Creates a new nautilus navigation bar. */
  function addNautilusBar() {
    // Default options for the chart.
    let axisOptions: echarts.EChartOption = {
      grid: {
        show: true,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      xAxis: {
        show: false,
        max: iterations,
        axisPointer: {
          show: true,
          label: {
            formatter: function (params: {
              axisDimension: string;
              value: number;
            }) {
              if (params.axisDimension === "x") {
                return (
                  // Show the step number as a percentage
                  Math.round((params.value / (iterations + 1)) * 100) + "%"
                );
              }
            },
          },
        },
      },
      // Get the max and min values from the current objective uncertainties and set them as the max and min values for the y-axis.
      yAxis: {
        // boundaryGap:["20%","20%"],
        max: yAxisMax ? yAxisMax : higherBound,
        min: yAxisMin ? yAxisMin : "dataMin",
        // max: Math.ceil(upperBound) ,
        // min: Math.floor(
        //   Math.min(
        //     ...bounds[idx].map((x) => {
        //       return x[0];
        //     })
        //   )
        // ),
        position: "right",
        axisLine: {
          onZero: false,
        },
        // axisTick: {
        //   show: false,
        // },
        axisLabel: {
          // showMinLabel: false,
          // showMaxLabel: false,
          inside: true,
          formatter: function (value: number, index: number) {
            // console.log(chart.getOption().yAxis[0].splitNumber);
            // console.log(value, index);
            if (index === 0) {
              return "Worst = " + value.toFixed(2);
            } else if (index === 6) {
              return "Best =  " + value.toFixed(2);
            }
            return value.toFixed(2);
          },
        },
      },
      tooltip: {
        show: false,
        triggerOn: "mousemove",
      },
      series: [
        {
          type: "custom",

          renderItem: (_, api) => {
            return draw(api);
          },
          data: objShape,
        },
      ],
    };

    chart.setOption(axisOptions);

    setDefaultGraphicOptions();
  }

  /**
   * Restricts the dragging of the aspiration and bound lines so that aspiration
   * line does not go below the bound line and vice versa.
   *
   * @param event The event that triggered the dragging. Used to get the line
   *   TODO: Add restriction which prevents dragging line outside feasible
   *   region
   */
  function restrictDrag(event: echarts.ElementEvent) {
    let newLineName = event.target.id;
    let lineToCompare;
    let compareLineY;
    let dragIsValid;

    let lineType = event.target.parent.id as number | string; // id type is number, but here it is used as a string

    if (lineType == "aspLine") {
      lineToCompare = getLineComponent(chart, "newBoundLine");
      // If the new part of the bound line is still invisible, use the y value of the old line
      compareLineY = lineToCompare.invisible
        ? getLineComponent(chart, "oldBoundLine").y
        : lineToCompare.y;
      dragIsValid = event.offsetY < compareLineY;
    } else {
      lineToCompare = getLineComponent(chart, "newAspLine");
      // If the aspiration line is still invisible, use the y value of the old line
      compareLineY = lineToCompare.invisible
        ? getLineComponent(chart, "oldAspLine").y
        : lineToCompare.y;
      dragIsValid = event.offsetY > compareLineY;
    }
    // Check if drag is valid compared to the other line and if it is inside the chart bounds
    if (dragIsValid && event.offsetY > 0 && event.offsetY < chart.getHeight()) {
      lastPosition = event.offsetY;
      if (lineType == "aspLine") {
        selectedValue = chart.convertFromPixel({ seriesIndex: 0 }, [
          event.offsetX,
          event.offsetY,
        ])[1];
      } else {
        selectedBoundValue = chart.convertFromPixel({ seriesIndex: 0 }, [
          event.offsetX,
          event.offsetY,
        ])[1];
      }
    }
    // Set the new drag position to the line
    chart.setOption({
      graphic: {
        id: newLineName,
        lastY: lastPosition,
        y: lastPosition,
      },
    });
  }

  /**
   * Updates the position of the aspiration or bound line.
   *
   * @param type The type of the line to update. Can be either "aspiration" or
   *   "bound".
   * @param newValue The new value of the line.
   */
  function updateLine(type: string, newValue: number | undefined) {
    if (!chart || newValue == null) {
      return;
    }
    let newY = chart.convertToPixel({ seriesIndex: 0 }, [
      newValue,
      newValue,
    ])[1];
    let idNew = type === "aspiration" ? "newAspLine" : "newBoundLine";
    let idOld = type === "aspiration" ? "oldAspLine" : "oldBoundLine";
    let invisible = getLineComponent(chart, "newAspLine").invisible;

    chart.setOption({
      graphic: {
        // If the new part of the line (newAspLine or newBoundLine) is invisible, use the old line (oldAspLine or oldBoundLine).
        id: invisible ? idOld : idNew,
        lastY: newY,
        y: newY,
      },
    });
  }

  /**
   * Updates the chart when the user clicks the next step button.
   *
   * @param idx The index of the current iteration.
   */
  function updateOnNewStep(idx: number) {
    // If chart is not initialized, do nothing
    if (!chart) {
      return;
    }
    if (idx < iterations) {
      // If the user has stepped back, reset the lines to the default position.
      if (stepBack) {
        updateStepLine();
        updateData();
        resetLine();
        stepBack = false;
      } else {
        idx = idx + 1;
        updateData();
        updateStepLine();
        if (idx > 0) {
          splitLine();
          addNewLine();
        }
      }
    }
  }

  /** Updates the position of the vertical line (step line). */
  function updateStepLine() {
    let xForVerticalLine = chart.convertToPixel({ seriesIndex: 0 }, [
      currentIterationIndex,
      0,
    ])[0];
    chart.setOption({
      graphic: [
        {
          id: "verticalLine",
          x: xForVerticalLine,
        },
      ],
    });
  }

  /**
   * Updates the shape of the aspiration and bound lines so that the parts of
   * the lines before current iteration shows as the history of the line.
   */
  function splitLine() {
    let oldLineComponent;
    let oldLinePoints;
    // Dont resize on the first iteration
    if (currentIterationIndex == 0) {
      return;
    }
    // Apply the logic for both lines
    applyForMultipleLines((wholeNameOld, wholeNameNew) => {
      let verticalLineComponent = getLineComponent(chart, "verticalLine");
      // Get the components of the aspiration line and the vertical line
      oldLineComponent = getLineComponent(chart, wholeNameOld);
      oldLinePoints = oldLineComponent.shape.points;

      //get the newLine
      let newAspLineComponent = getLineComponent(chart, wholeNameNew);
      let newAspLinePoints = newAspLineComponent.shape.points;
      let lastY =
        newAspLineComponent.y < 0 ? oldLineComponent.y : newAspLineComponent.y;

      // The line between the old aspiration values line and the current iteration vertical line
      let betweenLine = [
        [0, 0],
        [0, 0],
      ];

      let newPoints = oldLinePoints;
      if (newAspLinePoints[0][0] > 0) {
        newAspLinePoints[1][0] = verticalLineComponent.x;
        betweenLine = [
          [newAspLinePoints[0][0], lastY - oldLineComponent.y],
          [verticalLineComponent.x, lastY - oldLineComponent.y],
        ];
        newPoints = oldLinePoints.concat(betweenLine);
      }
      let newY = oldLineComponent.y;
      if (newPoints.length == 2) {
        newPoints[1][0] = verticalLineComponent.x;
      }
      if (newPoints.length <= 2) {
        newY = lastY;
      }
      chart.setOption({
        graphic: [
          {
            id: wholeNameOld,
            lastY: lastY,
            y: newY,
            draggable: false,
            shape: {
              points: newPoints,
            },
          },
        ],
      });
    });
  }

  /** Adds the draggable part of the line (Line after step line). */
  function addNewLine() {
    // TODO: Take the inner function out of the applyForMultipleLines function so it's more readable
    applyForMultipleLines((wholeNameOld, wholeNameNew) => {
      let verticalLineComponent = getLineComponent(chart, "verticalLine");
      let oldLineComponent = getLineComponent(chart, wholeNameOld);
      const lastIndex = oldLineComponent.shape.points.length - 1;
      const oldLineLastY = oldLineComponent.shape.points[lastIndex][1];
      const newY = oldLineComponent.lastY
        ? oldLineComponent.lastY
        : oldLineLastY;

      let newAspLinePoints = [
        [verticalLineComponent.x, 0],
        [
          getChartModel(chart).getComponent("xAxis").axis.grid.getRect().width,
          0,
        ],
      ];

      // Update the position of the line so that it is visible (and draggable) again.
      chart.setOption({
        graphic: {
          id: wholeNameNew,
          invisible: false,
          lastY: newY,
          y: newY,
          shape: {
            points: newAspLinePoints,
          },
        },
      });
    });
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

  /**
   * Applies the given function for both aspiration and bound lines.
   *
   * @param funToApply The function to apply for both lines.
   * @param onlyLinename If given, applies the function only for the given line.
   *   TODO: Divide this to 2 functions, the other could be applyForSingleLine.
   *   Then the parameter onlylinename could be deleted
   */
  function applyForMultipleLines(
    funToApply: (nameOld: string, nameNew: string) => void,
    onlyLinename?: string
  ) {
    if (onlyLinename) {
      funToApply("old" + onlyLinename, "new" + onlyLinename);
    } else {
      ["AspLine", "BoundLine"].forEach((lineTypeName) => {
        let wholeNameOld = "old" + lineTypeName;
        let wholeNameNew = "new" + lineTypeName;
        funToApply(wholeNameOld, wholeNameNew);
      });
    }
  }

  /**
   * Updates the interactivity of lines on the chart.
   *
   * @param disable If true, disables the interactivity of the lines. If false,
   *   enables the interactivity of the lines.
   */
  function updateInteractivity(disable: boolean) {
    if (!chart) {
      return;
    }
    chart.setOption({
      graphic: [
        {
          id: "newAspLine",
          silent: disable,
        },
        {
          id: "newBoundLine",
          silent: disable,
        },
        {
          id: "verticalLine",
          silent: disable,
        },
      ],
    });
  }

  /** Reset lines to default position */
  export function resetLinesToDefaults() {
    currentIterationIndex = 0;
    stepBack = true;
  }

  /** Resets the aspiration and bound lines to their default position. */
  function resetLine() {
    if (currentIterationIndex === 0) {
      setDefaultGraphicOptions();
    } else {
      applyForMultipleLines((wholeNameOld) => {
        let currentX = chart.convertToPixel({ seriesIndex: 0 }, [
          currentIterationIndex,
          0,
        ])[0];
        let old = getLineComponent(chart, wholeNameOld).shape;
        let val: number[][] = old.points;
        let end = val.length - 1;
        for (let i = 0; i < val.length; i++) {
          const point: number[] = val[i];
          if (point[0] === currentX) {
            end = i + 1;
            break;
          }
        }
        let test = val.slice(0, end);
        chart.setOption({
          graphic: {
            id: wholeNameOld,
            shape: {
              points: test,
            },
          },
        });
      });
      addNewLine();
    }
  }

  function setDefaultGraphicOptions() {
    // currentIterationIndex = 0;
    const xAxisRect = getChartModel(chart) // TODO: How to get info needed without getModel. This is a private method and it can break in the future!!https://github.com/apache/echarts/issues/16479
      .getComponent("xAxis")
      .axis.grid.getRect();

    // Add the default options of the aspiration and bound lines
    chart.setOption({
      // Add aspiration value line
      graphic: [
        {
          type: "group",
          id: "aspLine",
          children: [
            // The part of the aspiration line that shows the history
            {
              id: "oldAspLine",
              type: "polyline",
              z: 3,
              y: selectedValue
                ? chart.convertToPixel({ seriesIndex: 0 }, [
                    selectedValue,
                    selectedValue,
                  ])[1]
                : xAxisRect.height / 2,
              lastY: selectedValue
                ? chart.convertToPixel({ seriesIndex: 0 }, [
                    selectedValue,
                    selectedValue,
                  ])[1]
                : xAxisRect.height / 2,
              shape: {
                points: [
                  [0, 0],
                  [xAxisRect.width, 0],
                ],
              },
              style: aspirationLineStyle,
              draggable: "vertical",
              ondrag: restrictDrag,
            },
            // The part of the aspiration line that is on the right side of the vertical line
            {
              id: "newAspLine",
              type: "polyline",
              invisible: true,
              lastY: -99,
              y: -99,
              z: 3,
              shape: {
                points: [
                  [0, 0],
                  [xAxisRect.width, 0],
                ],
              },
              style: aspirationLineStyle,
              draggable: "vertical",
              ondrag: restrictDrag,
            },
          ],
        },
        // Bound line options
        {
          type: "group",
          id: "boundLine",
          children: [
            {
              id: "oldBoundLine",
              // type: "line",
              type: "polyline",
              z: 3,
              y: selectedBoundValue
                ? chart.convertToPixel({ seriesIndex: 0 }, [
                    selectedBoundValue,
                    selectedBoundValue,
                  ])[1]
                : xAxisRect.height - 2,
              lastY: selectedBoundValue
                ? chart.convertToPixel({ seriesIndex: 0 }, [
                    selectedBoundValue,
                    selectedBoundValue,
                  ])[1]
                : xAxisRect.height - 2,
              shape: {
                points: [
                  [0, 0],
                  [xAxisRect.width, 0],
                ],
              },
              style: boundLineStyle,
              draggable: "vertical",
              ondrag: restrictDrag,
            },
            {
              id: "newBoundLine",
              type: "polyline",
              lastY: -99,
              invisible: true,
              y: -99,
              z: 2,
              shape: {
                points: [
                  [0, 0],
                  [xAxisRect.width, 0],
                ],
              },
              style: boundLineStyle,
              draggable: "vertical",
              ondrag: restrictDrag,
            },

            // The vertical line that shows the current step
            {
              id: "verticalLine",
              type: "polyline",
              z: 4,
              x: chart.convertToPixel({ seriesIndex: 0 }, [
                currentIterationIndex,
                0,
              ])[0],
              shape: {
                points: [
                  [0, 0],
                  [0, xAxisRect.height],
                ],
              },
              style: {
                stroke: "black",
                lineWidth: 3,
              },
              draggable: "horizontal",
              // ondrag: function (params) {
              //   console.log(params);
              // },
              ondragend: function (params: echarts.ElementEvent) {
                let step = chart.convertFromPixel({ seriesIndex: 0 }, [
                  params.offsetX,
                  0,
                ])[0];
                let stepRounded = Math.round(step);
                if (stepRounded < currentIterationIndex) {
                  stepBack = true;
                  currentIterationIndex = stepRounded;
                }
                // console.log(currentIterationIndex);
                updateStepLine();
                // chart.setOption({
                //   graphic: {
                //     id: "verticalLine",
                //     x: chart.convertToPixel({ seriesIndex: 0 }, [
                //       currentIterationIndex,
                //       0,
                //     ])[0],
                //   },
                // });
              },
            },
          ],
        },
      ],
    });
  }
  onMount(() => {
    updateData();
    chart = echarts.init(chartDiv, undefined, {
      renderer: "svg",
    });
    addNautilusBar();
  });
</script>

<!--The div where the chart will be rendered. Must have width and height values for the chart to show.-->
<div style="height:100%; width:100%;" bind:this={chartDiv} />
<!-- Button for testing line resetting -->
<!-- <button on:click={resetLinesToDefaults}>Reset lines</button> -->
