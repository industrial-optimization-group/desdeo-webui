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

    
-->
<!-- TODO: documentation
    TODO: Make YAxis visible
    TODO: Add validation for input fields and lines
          - Aspiration value should be between upper and lower bounds
          - Aspiration line should not be draggable over the bound line
          - Bound value should be between ideal and nadir points
  
   -->
<script lang="ts">
  import { onMount } from "svelte";
  import * as echarts from "echarts";

  // The properties that can be passed to the component.
  // import { colorPalette } from "./stores";

  export let lowerBound: number;
  export let higherBound: number;
  export let iterations: number;
  export let currentIterationIndex = 0;
  export let selectedValue = higherBound + lowerBound / 2;
  export let selectedBoundValue = lowerBound;
  export let uncertaintyBounds: number[][];
  // export let colorPaletteIndex = 0;
  // export let inputs = false;

  // export let isMin = true;
  // export let divId: string;
  let chartDiv: HTMLElement;
  let chart: echarts.EChartsType;

  // export function updateSelected() {
  //   updateLine();
  // }

  // let objShape: number[][] = [];

  const aspirationLineStyle = {
    stroke: "blue",
    lineDash: [4],
    lineWidth: 3,
  };
  const boundLineStyle = {
    stroke: "red",
    // lineDash: [4],
    lineWidth: 3,
  };

  let objShape: number[][] = [];
  /** Updates the data that is used to draw the feasible region. */
  updateData();
  function updateData() {
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

  function draw(
    api: echarts.EChartOption.SeriesCustom.RenderItemApi
    // objectiveIndex: number
  ): echarts.EChartOption.SeriesCustom.RenderItemReturnPolygon {
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

  /**
   * Creates a new nautilus navigation bar.
   *
   * @param id The id of the div element where the chart will be drawn.
   * @param idx The index of the objective.
   */
  function addNautilusBar() {
    // Default options for the chart.
    let newOption: echarts.EChartOption = {
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
            formatter: function (params) {
              if (params.axisDimension === "x") {
                return (
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
        max: "dataMax",
        min: "dataMin",
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
          formatter: function (value, index) {
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
    chart.setOption(newOption);

    const xAxisRect = chart
      .getModel() // TODO: How to get info needed without getModel. This is a private method and it can break in the future!!https://github.com/apache/echarts/issues/16479
      .getComponent("xAxis")
      .axis.grid.getRect();

    chart.setOption({
      // Add aspiration value line
      graphic: [
        {
          type: "group",
          id: "aspLine",
          children: [
            {
              id: "oldAspLine",
              // type: "line",
              type: "polyline",
              z: 3,
              // y: 0,
              shape: {
                points: [
                  [0, xAxisRect.height / 2],
                  [xAxisRect.width, xAxisRect.height / 2],
                ],
              },
              style: aspirationLineStyle,
              draggable: "vertical",
              // ondragstart: function (event){
              //   splitLine(chart, event.offsetX, event.offsetY);
              // },
              // onmousedown:function (event){

              //   // addNewLine(chart, event.offsetX, event.offsetY);
              // },
              ondrag: function (event: echarts.ElementEvent) {
                // Convert drag Y pixel value to Y real value and update the value to the aspValues (updates input field value also)
                selectedValue = chart.convertFromPixel({ seriesIndex: 0 }, [
                  event.offsetX,
                  event.offsetY,
                ])[1];

                // TODO: what is the type of this? It's not CustomRenderItemParams. this.x and .y are used in documentation so should be ok to use

                // updateLine(chart, idx, event.offsetX, event.offsetY, false);
              },
              ondragend: function (event: echarts.ElementEvent) {
                // updateLineShape(chart, event.offsetX, event.offsetY);

                let lastY = event.offsetY;

                chart.setOption({
                  graphic: {
                    id: "oldAspLine",
                    lastY: lastY,
                    y: 0,
                    shape: {
                      points: [
                        [0, lastY],
                        [xAxisRect.width, lastY],
                      ],
                    },
                  },
                });
              },
            },
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
            },
            {
              id: "newAspLine",
              type: "polyline",
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
              /* style: {
            stroke: "red",
            lineWidth: 6,
          }, */
              draggable: "vertical",
              ondrag: function (event: echarts.ElementEvent) {
                selectedValue = chart.convertFromPixel({ seriesIndex: 0 }, [
                  event.offsetX,
                  event.offsetY,
                ])[1];
                chart.setOption({
                  graphic: {
                    id: "newAspLine",
                    lastY: event.offsetY,
                  },
                });
              },
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
              // y: 0,
              shape: {
                points: [
                  [0, xAxisRect.height - 2],
                  [xAxisRect.width, xAxisRect.height - 2],
                ],
              },
              style: boundLineStyle,
              draggable: "vertical",
              // ondragstart: function (event){
              //   splitLine(chart, event.offsetX, event.offsetY);
              // },
              // onmousedown:function (event){

              //   // addNewLine(chart, event.offsetX, event.offsetY);
              // },
              ondrag: function (event: echarts.ElementEvent) {
                // Convert drag Y pixel value to Y real value and update the value to the aspValues (updates input field value also)
                selectedBoundValue = chart.convertFromPixel(
                  { seriesIndex: 0 },
                  [event.offsetX, event.offsetY]
                )[1];

                // TODO: what is the type of this? It's not CustomRenderItemParams. this.x and .y are used in documentation so should be ok to use

                // updateLine(chart, idx, event.offsetX, event.offsetY, false);
              },
              ondragend: function (event: echarts.ElementEvent) {
                // updateLineShape(chart, event.offsetX, event.offsetY);

                let lastY = event.offsetY;

                chart.setOption({
                  graphic: {
                    id: "oldBoundLine",
                    lastY: lastY,
                    y: 0,
                    shape: {
                      points: [
                        [0, lastY],
                        [xAxisRect.width, lastY],
                      ],
                    },
                  },
                });
              },
            },
            {
              id: "newBoundLine",
              type: "polyline",
              lastY: -99,
              y: -99,
              z: 2,
              shape: {
                points: [
                  [0, 0],
                  [xAxisRect.width, 0],
                ],
              },
              style: boundLineStyle,
              /* style: {
            stroke: "red",
            lineWidth: 6,
          }, */
              draggable: "vertical",
              ondrag: function (event: echarts.ElementEvent) {
                selectedBoundValue = chart.convertFromPixel(
                  { seriesIndex: 0 },
                  [event.offsetX, event.offsetY]
                )[1];
                chart.setOption({
                  graphic: {
                    id: "newBoundLine",
                    lastY: event.offsetY,
                  },
                });
              },
            },
          ],
        },
      ],
    });
  }

  onMount(() => {
    chart = echarts.init(chartDiv);
    addNautilusBar();
  });

  //TODO: step line dragging
  function updateStepLine() {
    let xForVerticalLine = chart.convertToPixel({ seriesIndex: 0 }, [
      currentIterationIndex,
      0,
    ])[0];

    chart.setOption({
      graphic: [
        {
          id: "verticalLine",
          type: "polyline",

          x: xForVerticalLine,
        },
      ],
    });
  }

  /**
   * Updates the y-position of the aspiration line according to the new y-value.
   *
   * @param chart The chart where the aspiration line is.
   * @param newY The new y-value.
   */
  // function updateLine(
  //   chart: echarts.EChartsType,
  //   newY: number,
  //   lineName?: string
  // ) {
  //   applyForMultipleLines((oldName, newName) => {
  //     let oldLineComponentPoints = getLineComponent(chart, "oldAspLine").shape
  //       .points;
  //     // let teset = getLineComponent(chart, "aspLine");
  //     oldLineComponentPoints[0][1] = newY;
  //     oldLineComponentPoints[1][1] = newY;
  //     if (currentIterationIndex == 0) {
  //       chart.setOption({
  //         graphic: [
  //           {
  //             id: oldName,
  //             shape: {
  //               points: oldLineComponentPoints,
  //             },
  //           },
  //         ],
  //       });
  //     } else {
  //       chart.setOption({
  //         graphic: [
  //           {
  //             id: newName,
  //             lastY: newY,
  //             y: newY,
  //             transition: "y",
  //           },
  //         ],
  //       });
  //     }
  //   }, lineName);
  // }

  /**
   * Updates the shape of the aspiration line so that the line before current
   * iteration shows the history of the aspiration line.
   *
   * @param chart The chart where the aspiration line is.
   */
  function splitLine() {
    let oldLineComponent;
    let oldLinePoints;
    // let verticalLineComponent;
    // Dont resize on the first iteration
    if (currentIterationIndex == 0) {
      return;
    }

    applyForMultipleLines((wholeNameOld, wholeNameNew) => {
      let verticalLineComponent = getLineComponent(chart, "verticalLine");
      // Get the components of the aspiration line and the vertical line
      oldLineComponent = getLineComponent(chart, wholeNameOld);
      oldLinePoints = oldLineComponent.shape.points;

      //get the newLine
      let newAspLineComponent = getLineComponent(chart, wholeNameNew);
      let newAspLinePoints = newAspLineComponent.shape.points;
      let lastY =
        newAspLineComponent.lastY < 0
          ? oldLineComponent.lastY
          : newAspLineComponent.lastY;
      if (currentIterationIndex == 1) {
        oldLinePoints[1][0] = verticalLineComponent.x;
      } else {
        oldLinePoints[oldLinePoints.length - 1][0] = verticalLineComponent.x;
      }
      // The line between the old aspiration values line and the current iteration vertical line
      let betweenLine = [
        [0, 0],
        [0, 0],
      ];
      let newPoints = oldLinePoints;
      if (newAspLinePoints[0][0] > 0) {
        newAspLinePoints[1][0] = verticalLineComponent.x;
        betweenLine = [
          [newAspLinePoints[0][0], lastY],
          [verticalLineComponent.x, lastY],
        ];
        newPoints = oldLinePoints.concat(betweenLine);
      }

      // Update the position of the aspiration line and make it visible
      chart.setOption({
        graphic: [
          {
            id: wholeNameOld,
            lastY: lastY,
            shape: {
              points: newPoints,
            },
          },
        ],
      });
    });
  }

  /**
   * Adds the draggable part of the aspiration line.
   *
   * @param chart The chart where the aspiration line is.
   */
  function addNewLine() {
    // Get the components of the aspiration line and the vertical line
    applyForMultipleLines((wholeNameOld, wholeNameNew) => {
      let verticalLineComponent = getLineComponent(chart, "verticalLine");
      let oldLineComponent = getLineComponent(chart, wholeNameOld);
      const lastIndex = oldLineComponent.shape.points.length - 1;
      // const oldLineLastX = oldLineComponent.shape.points[lastIndex][0];
      const oldLineLastY = oldLineComponent.shape.points[lastIndex][1];
      const newY = oldLineComponent.lastY
        ? oldLineComponent.lastY
        : oldLineLastY;

      let newAspLinePoints = [
        [verticalLineComponent.x, 0],
        [chart.getModel().getComponent("xAxis").axis.grid.getRect().width, 0],
      ];

      // Update the position of the aspiration line so that it is visible (and draggable) again.
      chart.setOption({
        graphic: {
          id: wholeNameNew,
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
   * Gets the component of the wanted part of the aspiration line.
   *
   * @param chart The chart where the aspiration line is.
   * @param lineId The id of the wanted part of the aspiration line.
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
</script>

<!-- Button for simulating iterating -->
<button
  on:click={function () {
    if (currentIterationIndex < iterations) {
      currentIterationIndex = currentIterationIndex + 1;

      // chart.resize({width: "200", height: "200"});
      updateData();
      updateStepLine();
      if (currentIterationIndex > 0) {
        splitLine();
        addNewLine();
      }
      chart.setOption({});
    }

    // console.log(currentIterationIndex);
  }}>Next Iteration</button
>
<p>{currentIterationIndex}</p>
<!--The div where the chart will be rendered. Must have width and height values for the chart to show.-->
<div style="height:100%; width:100%" bind:this={chartDiv} />
